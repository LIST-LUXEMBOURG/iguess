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
    query = "SELECT mc.id, pid, c.srs " \
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

    print "\n\nChecking ", pid, "..."

    # Check for bad records that will cause crashy-crashy
    if pid == None:
        print "Found invalid mod_config record with id " + str(recordId)
        continue

    client.initFromURL(pid)

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

                print "inserting " + str(recordId) + " " + r.name + " " + r.value


            print "============= Complex\n"
            for r in client.resultsComplex:
                print r.name, " ==> ", r.uniqueID, " --- ", 

                if srs.startswith("EPSG:"):     # Strip prefix, if it exists
                    srs = srs[5:]

                client.epsg = srs   
    
                print "XXX ==>" + client.generateMapFile()



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


