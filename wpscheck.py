#!/usr/bin/python

import sys, psycopg2, WPSClient, datetime

if len(sys.argv) < 5:
    print "Usage: wpscheck <dbserver> <database> <user> <password>\n"
    sys.exit(2)

dbserver = sys.argv[1]
database = sys.argv[2]
dbuser   = sys.argv[3]
dbpass   = sys.argv[4]

schema = 'iguess_dev'

connstr = "dbname='" + database + "' user='" + dbuser +"' host='" + dbserver + "' password='" + dbpass + "'"


try:
    conn = psycopg2.connect(connstr)
except:
    print "Can't connect to database!"    
    sys.exit(2)

cur = conn.cursor()

try:
    query = "SELECT mc.id, pid, c.srs, c.id " \
            "FROM " + schema + ".mod_configs AS mc " \
            "LEFT JOIN " + schema + ".cities AS c ON c.id = mc.city_id " \
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
        query = "select column_name, value from " + schema + ".config_text_inputs where mod_config_id = " + str(recordId) + " and is_input = FALSE"
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

    if not status:
        print "There was an error checking the status of running modules!"
        sys.exit(2)

    print "Status = ", client.status

    if client.status == client.RUNNING:      # 1
        queryTemplate = "UPDATE " + schema + ".mod_configs " \
                        "SET status = 'RUNNING', status_text = %s " \
                        "WHERE id = %s"
        cur.execute(queryTemplate, (str(client.percentCompleted) + '% complete', recordId))
        conn.commit()


    elif client.status == client.FINISHED:   # 2
        # try:

            # Update status in the database
            queryTemplate = "UPDATE " + schema + ".mod_configs " \
                            "SET status = 'FINISHED', status_text = %s, run_ended = %s " \
                            "WHERE id = %s" 

            cur.execute(queryTemplate, (client.processErrorText, str(datetime.datetime.now()), recordId))
                   
            for r in client.resultsLiteral:

                print "Processing literal result ", r.name, " = ", r.value, "..."

                # Clean out any old results
                queryTemplate = "DELETE FROM " + schema + ".config_text_inputs " \
                                "WHERE mod_config_id = %s AND column_name = %s AND is_input = %s"
                cur.execute(queryTemplate, (recordId, r.name, False))      


                # Insert fresh ones
                queryTemplate = "INSERT INTO " + schema + ".config_text_inputs "\
                                "(mod_config_id, column_name, value, is_input)" \
                                "VALUES(%s, %s, %s, %s)"
                cur.execute(queryTemplate, (recordId, r.name, r.value, False))


            for r in client.resultsComplex:
                print "Processing complex result ", r.name, " with id of ", r.uniqueID




                if srs.startswith("EPSG:"):     # Strip prefix, if it exists
                    srs = srs[5:]

                client.epsg = srs   
    
                # Retrieve and save the data locally to disk, creating a mapfile in the process
                mapfile = client.generateMapFile()

                url = 'http://services.iguess.tudor.lu/cgi-bin/mapserv?map=' + mapfile
                identifier = r.name
                dataset_type = 'Mapping Only'        # For now

                queryTemplate = "INSERT INTO " + schema + ".datasets "\
                                "(server_url, identifier, dataset_type, city_id, finalized, created_at, updated_at)" \
                                "VALUES(%s, %s, %s, %s, %s, %s, %s)"
                cur.execute(queryTemplate, (url, identifier, dataset_type, str(city_id), True, str(datetime.datetime.now()), str(datetime.datetime.now())))
                #http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/LB_localOWS_test.map

            conn.commit()

        # except:
        #     print "Can't update process status!"
        #     sys.exit(2)    

    elif client.status == client.ERROR:    

        # print client.processErrorCode
        # print client.processErrorText

        try:
            queryTemplate = "UPDATE " + schema + ".mod_configs " \
                            "SET status = 'ERROR', status_text = %s, run_ended = %s " \
                            "WHERE id = %s" 

            cur.execute(queryTemplate, (client.processErrorText, str(datetime.datetime.now()), recordId))
            conn.commit()

        except:
            print "Can't update process status!"
            sys.exit(2)    

    else:
        print "Unknown status: ", str(client.status)
        sys.exit(2)


    print client.xmlResponse


