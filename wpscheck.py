#!/usr/bin/python

import sys
import psycopg2
import WPSClient.WPSClient as WPSClient
import datetime
import logging

from iguess_db_credentials import dbServer, dbName, dbUsername, dbPassword, dbSchema, baseMapServerUrl, logFileName

connstr = "dbname='" + dbName + "' user='" + dbUsername +"' host='" + dbServer + "' password='" + dbPassword + "'"

logLevel = "INFO"



def configLogging(logfile, loglevel):
    '''
    Set up the logging file
    '''

    format = "[%(asctime)s] %(levelname)s: %(message)s"
    logging.basicConfig(filename=logfile, level=loglevel, format=format)



def logErrorMsg(recordId, msg):
    ''' 
    Write an error message into the databse in a way that will cause it to appear in iGUESS UI 
    '''

    if(recordId):
        queryTemplate = "UPDATE " + dbSchema + ".mod_configs " \
            "SET run_status_id = " + str(ERROR) + ", status_text = %s, run_ended = %s " \
            "WHERE id = %s" 

        cur.execute(queryTemplate, (msg, str(datetime.datetime.now()), recordId))
        conn.commit()

    logging.error(str(recordId) + " " + msg)
    print str(recordId) + " " + msg   # Very helpful when running from cmd line



def logInfoMsg(msg):
    '''
    Print out a warning message, and log it to the logFile
    '''

    logging.info(msg)
    print msg




configLogging(logFileName, logLevel)

try:
    conn = psycopg2.connect(connstr)
except:
    logErrorMsg(None, "Database Error: Can't connect to database " + dbName + "!")
    sys.exit(2)

cur  = conn.cursor()
qcur = conn.cursor()



def getRunningFinishedErrorVals():
    sql = "SELECT id, status FROM " + dbSchema + ".run_statuses WHERE status IN ('RUNNING', 'FINISHED', 'ERROR')"

    cur.execute(sql)

    rows = cur.fetchall()

    r = s = e = None

    for row in rows:
        id = row[0]
        status = row[1]

        if(status == 'RUNNING'):
            r = id 
        elif(status == 'FINISHED'):
            s = id 
        elif(status == 'ERROR'):
            e = id

    if(not(r and s and e)):
        raise ValueError("Could not find required status in run_status table")


# Define constants for communication between different sotware bits
RUNNING, FINISHED, ERROR = getRunningFinishedErrorVals()

try:
    query = "SELECT mc.id, pid, c.srs, c.id " \
            "FROM " + dbSchema + ".mod_configs AS mc " \
            "LEFT JOIN " + dbSchema + ".cities AS c ON c.id = mc.city_id " \
            "WHERE run_status_id = " + str(RUNNING)
            #"WHERE mc.id = 144"
            
    cur.execute(query)

except:
    logErrorMsg(None, "Database Error: Can't retrieve list of running processes from database!")
    sys.exit(2)

rows = cur.fetchall()

try:
    client = WPSClient.WPSClient()
except Exception as ex:
    logErrorMsg(recordId, "Process Error: Could not initialize WPSClient module - " + str(ex))


for row in rows:
    recordId = row[0]
    pid = row[1]
    srs = row[2]
    city_id = row[3]

    logInfoMsg("Checking pid " + str(pid) + "...")


    # Check for bad records that will cause crashy-crashy
    if pid == None:
        logInfoMsg("Found invalid mod_config record with id " + str(recordId))
        continue

    identifiers = {}
    #titles = [ ]


    try:
        query = "select column_name, value from " + dbSchema + ".config_text_inputs where mod_config_id = " + str(recordId) + " and is_input = FALSE"
        cur.execute(query)
    except:
        logging.warning("Can't get params for config id " + str(recordId))
        continue

    outs = cur.fetchall()
    for out in outs:
        identifiers[out[0]] = out[1]
        #titles.append(out[1])

    try:
        client.initFromURL(pid, identifiers)#, titles)
    except Exception as ex:
        logErrorMsg(recordId, "Process Error: initFromURL() call failed - " + str(ex))
        continue

    if srs.startswith("EPSG:"):          # Strip prefix, if there is one
        srs = srs[5:]

    client.epsg = srs   

    try:
        status = client.checkStatus()        # Returns true if checkStatus worked, false if it failed
    except Exception as ex:
        logErrorMsg(recordId, "Process Error: checkStatus() call failed - " + str(ex))
        continue

    #if not status:
        #print "There was an error checking the status of running modules!"
        #sys.exit(2)

    logInfoMsg("Status = " + str(client.status))


    if client.status == client.RUNNING:      # 1... 
        queryTemplate = "UPDATE " + dbSchema + ".mod_configs " \
                        "SET run_status_id = " + str(RUNNING) + ", status_text = %s " \
                        "WHERE id = %s"
        cur.execute(queryTemplate, (str(client.percentCompleted) + '% complete', recordId))
        conn.commit()

    elif client.status == client.FINISHED:   # 2
        mapfile = ""

        try:
            # Retrieve and save the data locally to disk, creating a mapfile in the process
            mapfile = client.generateMapFile()

            if mapfile is None:
                logErrorMsg(recordId, "Process Error: Got None back from generateMapFile()")
                sys.exit(2)

        except Exception as ex:
            logErrorMsg(recordId, "Process Error: generateMapFile() call failed - " + str(ex))
            continue

        url = baseMapServerUrl + mapfile

        try:

            # Update status in the database
            queryTemplate = "UPDATE " + dbSchema + ".mod_configs " \
                            "SET run_status_id = " + str(FINISHED) + ", status_text = %s, run_ended = %s " \
                            "WHERE id = %s" 

            cur.execute(queryTemplate, (client.processErrorText, str(datetime.datetime.now()), recordId))
                   
            for r in client.dataSets:
                
                if r.dataType is r.TYPE_LITERAL:
                    
                    print "** Processing literal: " + r.name

                    logInfoMsg("Processing literal result " + r.name +  " = " + str(r.value) +  "...")
    
                    # Clean out any old results
                    queryTemplate = "DELETE FROM " + dbSchema + ".config_text_inputs " \
                                    "WHERE mod_config_id = %s AND column_name = %s AND is_input = %s"
                    cur.execute(queryTemplate, (recordId, r.name, False))      
    
    
                    # Insert fresh ones
                    queryTemplate = "INSERT INTO " + dbSchema + ".config_text_inputs " \
                                    "(mod_config_id, column_name, value, is_input)"  \
                                    "VALUES(%s, %s, %s, %s)"
                    cur.execute(queryTemplate, (recordId, r.name, r.value, False))


                else:
                    
                    logInfoMsg("Processing complex result " + r.name + " with id of " + r.uniqueID)
    
                    # Check if data server already exists in the database, otherwise insert it.  We need the record id
                    qcur.execute("SELECT id FROM " + dbSchema + ".dataservers WHERE url = %s", (url,))        # Trailing , needed
                    if qcur.rowcount == 0:
                        titleServ = "iGUESS results server"
                        abstract = "Server hosting the results of a module run"
                        qcur.execute("INSERT INTO " + dbSchema + ".dataservers (url, title, abstract, alive, wms, wfs, wcs) "\
                                     "VALUES(%s, %s, %s, %s, %s, %s, %s) RETURNING id", 
                                                        (url, titleServ, abstract, True, True, True, True))
    
                    if qcur.rowcount == 0:
                        logErrorMsg(recordId, "Database Error: Unable to insert record into dataservers table!")
                        continue
    
                    serverId = qcur.fetchone()[0]
                    
                    service = "WMS"
                    
                    if r.dataType == r.TYPE_VECTOR:
                        service = "WFS"
                    elif r.dataType == r.TYPE_RASTER:
                        service = "WCS"
    
                    queryTemplate = "INSERT INTO " + dbSchema + ".datasets "\
                                    "(title, server_url, dataserver_id, identifier, abstract, city_id, alive, finalized, created_at, updated_at, service)" \
                                    "VALUES((SELECT value FROM " + dbSchema + ".config_text_inputs " \
                                        "WHERE mod_config_id = %s AND column_name = %s AND is_input = FALSE), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) "\
                                    "RETURNING id"
    
                    abstract = "Result calculated with module"
                    
                    qcur.execute(queryTemplate, (recordId, r.uniqueID, url, serverId, r.uniqueID, abstract, str(city_id), True, True, 
                                                 str(datetime.datetime.now()), str(datetime.datetime.now()), service) )
    
                    if qcur.rowcount == 0:
                        logErrorMsg(recordId, "Database Error: Unable to insert record into datasets table")
                        continue
    
                    insertedId = qcur.fetchone()[0]
    
                    # Insert mapping tag
                    qcur.execute("insert into " + dbSchema + ".dataset_tags(dataset_id, tag) values(" + str(insertedId) + ", 'Mapping')")

            conn.commit()

        except:
            logErrorMsg(recordId, "Process Error: Last client status was " + str(client.status))
            continue    

    elif client.status == client.ERROR:    

        logErrorMsg(recordId, "Process Error: " + str(client.processErrorText))
        continue


    else:
        logErrorMsg(recordId, "Process Error: Unknown status " + str(client.status))
        continue


    #logInfoMsg(client.xmlResponse)
