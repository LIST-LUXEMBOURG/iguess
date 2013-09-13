#!/usr/bin/python

import sys
import psycopg2
import WPSClient
import datetime

from iguess_db_credentials import dbServer, dbName, dbUsername, dbPassword, dbSchema, baseMapServerUrl

connstr = "dbname='" + dbName + "' user='" + dbUsername +"' host='" + dbServer + "' password='" + dbPassword + "'"


def logErrorMsg(msg):
    queryTemplate = "UPDATE " + dbSchema + ".mod_configs " \
        "SET status = 'ERROR', status_text = %s, run_ended = %s " \
        "WHERE id = %s" 

    cur.execute(queryTemplate, (msg, str(datetime.datetime.now()), recordId))
    conn.commit()

try:
    conn = psycopg2.connect(connstr)
except:
    print "Can't connect to database " + dbName + "!"    
    sys.exit(2)

cur  = conn.cursor()
qcur = conn.cursor()

try:
    query = "SELECT mc.id, pid, c.srs, c.id " \
            "FROM " + dbSchema + ".mod_configs AS mc " \
            "LEFT JOIN " + dbSchema + ".cities AS c ON c.id = mc.city_id " \
            "WHERE status = 'RUNNING'"

    cur.execute(query)

except:
    print "Can't fetch running processes!"
    sys.exit(2)

rows = cur.fetchall()

client = WPSClient.WPSClient()


for row in rows:
    recordId = row[0]
    pid = row[1]
    srs = row[2]
    city_id = row[3]

    print "\n\nChecking ", pid, "..."

    # Check for bad records that will cause crashy-crashy
    if pid == None:
        print "Found invalid mod_config record with id " + str(recordId)
        continue

    identifiers = [ ]
    titles = [ ]


    try:
        query = "select column_name, value from " + dbSchema + ".config_text_inputs where mod_config_id = " + str(recordId) + " and is_input = FALSE"
        cur.execute(query)
    except:
        print "Can't get params for config id " + str(recordId)
        continue

    outs = cur.fetchall()
    for out in outs:
        identifiers.append(out[0])
        titles.append(out[1])

    client.initFromURL(pid, identifiers, titles)

    status = client.checkStatus()        # Returns true if checkStatus worked, false if it failed

    #if not status:
        #print "There was an error checking the status of running modules!"
        #sys.exit(2)

    print "Status = ", client.status

    if client.status == client.RUNNING:      # 1
        queryTemplate = "UPDATE " + dbSchema + ".mod_configs " \
                        "SET status = 'RUNNING', status_text = %s " \
                        "WHERE id = %s"
        cur.execute(queryTemplate, (str(client.percentCompleted) + '% complete', recordId))
        conn.commit()


    elif client.status == client.FINISHED:   # 2
        try:
            # Retrieve and save the data locally to disk, creating a mapfile in the process
            mapfile = client.generateMapFile()
            url = baseMapServerUrl + mapfile
        except:
            logErrorMsg("Process Error: generateMapFile call failed (" + mapfile + ")")
            sys.exit(2)

        try:

            # Update status in the database
            queryTemplate = "UPDATE " + dbSchema + ".mod_configs " \
                            "SET status = 'FINISHED', status_text = %s, run_ended = %s " \
                            "WHERE id = %s" 

            cur.execute(queryTemplate, (client.processErrorText, str(datetime.datetime.now()), recordId))
                   
            for r in client.resultsLiteral:

                print "Processing literal result ", r.name, " = ", r.value, "..."

                # Clean out any old results
                queryTemplate = "DELETE FROM " + dbSchema + ".config_text_inputs " \
                                "WHERE mod_config_id = %s AND column_name = %s AND is_input = %s"
                cur.execute(queryTemplate, (recordId, r.name, False))      


                # Insert fresh ones
                queryTemplate = "INSERT INTO " + dbSchema + ".config_text_inputs " \
                                "(mod_config_id, column_name, value, is_input)"  \
                                "VALUES(%s, %s, %s, %s)"
                cur.execute(queryTemplate, (recordId, r.name, r.value, False))


            for r in client.resultsComplex:
                print "Processing complex result ", r.name, " with id of ", r.uniqueID

                if srs.startswith("EPSG:"):     # Strip prefix, if it exists
                    srs = srs[5:]

                client.epsg = srs   
    
                identifier = r.name


                # Check if data server already exists in the database, otherwise insert it.  We need the record id
                qcur.execute("SELECT id FROM " + dbSchema + ".dataservers WHERE url = %s", (url,))        # Trailing , needed
                if qcur.rowcount == 0:
                    title = "iGUESS results server"
                    abstract = "Server hosting the results of a module run"
                    qcur.execute("INSERT INTO " + dbSchema + ".dataservers (url, title, abstract, alive, wms, wfs, wcs) "\
                                 "VALUES(%s, %s, %s, %s, %s, %s, %s) RETURNING id", 
                                                    (url, title, abstract, True, True, False, False))

                if qcur.rowcount == 0:
                    print "Unable to insert data, quitting..."
                    sys.exit(2)

                serverId = qcur.fetchone()[0]

                queryTemplate = "INSERT INTO " + dbSchema + ".datasets "\
                                "(title, server_url, dataserver_id, identifier, abstract, city_id, alive, finalized, created_at, updated_at)" \
                                "VALUES((SELECT value FROM " + dbSchema + ".config_text_inputs " \
                                    "WHERE mod_config_id = %s AND column_name = %s AND is_input = FALSE), %s, %s, %s, %s, %s, %s, %s, %s, %s) "\
                                "RETURNING id"

                abstract = "Result calculated with module"
                
                qcur.execute(queryTemplate, (recordId, identifier, url, serverId, identifier, abstract, str(city_id), True, True, str(datetime.datetime.now()), str(datetime.datetime.now())))

                if qcur.rowcount == 0:
                    print "Unable to insert data II, quitting..."
                    sys.exit(2)

                insertedId = qcur.fetchone()[0]

                # Insert mapping tag
                qcur.execute("insert into " + dbSchema + ".dataset_tags(dataset_id, tag) values(" + str(insertedId) + ", 'Mapping')")

            conn.commit()

        except:
            logErrorMsg("Process Error: last status was " + str(client.status))

            print "Can't update process status!"
            sys.exit(2)    

    elif client.status == client.ERROR:    

        try:
            logErrorMsg(client.processErrorText)

        except:
            print "Can't update process status!"
            sys.exit(2)    

    else:
        print "Unknown status: ", str(client.status)
        sys.exit(2)


    print client.xmlResponse


