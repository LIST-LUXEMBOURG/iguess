#!/usr/bin/python
'''
Script to periodically check the status of running modules.  
This script should be run from cron on a regular basis.
'''

############################################################
# Imports

import sys
import psycopg2
import WPSClient.WPSClient as WPSClient
import datetime
import logging

from iguess_db_credentials import dbServer, dbName, dbUsername, dbPassword, dbSchema, baseMapServerUrl, logFileName


############################################################
# Some contants you might want to adjust:

logLevel = "INFO"

############################################################
# Global vars -- will be assigned later

RUNNING = FINISHED = ERROR = None
cur = qcur = db_conn = None

############################################################


def config_logging(logfile, loglevel):
    '''
    Set up the logging file
    '''

    format = "[%(asctime)s] %(levelname)s: %(message)s"
    logging.basicConfig(filename=logfile, level=loglevel, format=format)


def initialize_database_connection():
    global db_conn, cur, qcur

    try:
        connstr = ("dbname='" + dbName + "' user='" + dbUsername +"' " +
                   "host='" + dbServer + "' password='" + dbPassword + "'")
        db_conn = psycopg2.connect(connstr)
    except:
        # Can't log error message until logging is configured, which requires a db connection.  What do do!
        # log_error_msg(None, "Database Error: Can't connect to database " + dbName + "!")
        sys.exit(2)

    cur  = db_conn.cursor()
    qcur = db_conn.cursor()


def log_error_msg(recordId, msg):
    ''' 
    Write an error message into the databse in a way that will cause it to appear in iGUESS UI 
    '''

    if(recordId):
        query_template = ("UPDATE " + dbSchema + ".mod_configs " 
                          "SET run_status_id = " + str(ERROR) + ", status_text = %s, run_ended = %s " 
                          "WHERE id = %s" )

        cur.execute(query_template, (msg, str(datetime.datetime.now()), recordId))
        db_conn.commit()

    logging.error(str(recordId) + " " + msg)
    print str(recordId) + " " + msg   # Very helpful when running from cmd line


def log_info_msg(msg):
    '''
    Print out a warning message, and log it to the logFile
    '''

    logging.info(msg)
    print msg


def get_running_finished_error_vals():
    '''
    Fetch status messages/codes from the database
    Will throw a ValueError if one of the expected statuses cannot be found
    '''
    global RUNNING, FINISHED, ERROR

    sql = ("SELECT id, status FROM " + dbSchema + ".run_statuses "
           "WHERE status IN ('RUNNING', 'FINISHED', 'ERROR')")

    cur.execute(sql)

    rows = cur.fetchall()

    r = f = e = None

    for row in rows:
        id = row[0]
        status = row[1]

        if(status == 'RUNNING'):
            r = id 
        elif(status == 'FINISHED'):
            f = id 
        elif(status == 'ERROR'):
            e = id

    if(not(r and f and e)):
        raise ValueError("Could not find required status in run_status table")

    return r, f, e


def main():
    initialize_database_connection()
    config_logging(logFileName, logLevel)

    # Define constants for communication between different sotware bits
    RUNNING, FINISHED, ERROR = get_running_finished_error_vals()

    try:
        query = ("SELECT mc.id, pid, c.srs, c.id "                              
                 "FROM " + dbSchema + ".mod_configs AS mc "                     
                 "LEFT JOIN " + dbSchema + ".cities AS c ON c.id = mc.city_id " 
                 "WHERE run_status_id = " + str(RUNNING))
                
        cur.execute(query)

    except:
        log_error_msg(None, "Error: Can't retrieve list of running processes from database!")
        sys.exit(2)

    rows = cur.fetchall()

    try:
        client = WPSClient.WPSClient()
    except Exception as ex:
        log_error_msg(None, "Error: Could not initialize WPSClient module - " + str(ex))


    for row in rows:
        recordId, pid, srs, city_id = row

        log_info_msg("Checking pid " + str(pid) + "...")


        # Check for bad records that will cause crashy-crashy
        if pid == None:
            log_info_msg(recordId, "Found invalid mod_config record with id " + str(recordId))
            continue

        identifiers = {}

        try:
            query = ("SELECT column_name, value FROM " + dbSchema + ".config_text_inputs "
                     "WHERE mod_config_id = " + str(recordId) + " AND is_input = False")
            cur.execute(query)
        except:
            logging.warning("Can't get params for config id " + str(recordId))
            continue

        outs = cur.fetchall()
        for out in outs:
            identifiers[out[0]] = out[1]

        try:
            client.initFromURL(pid, identifiers)
        except Exception as ex:
            log_error_msg(recordId, "Error: initFromURL() call failed - " + str(ex))
            continue

        if srs.startswith("EPSG:"):          # Strip prefix, if there is one
            srs = srs[5:]

        client.epsg = srs   

        try:
            status = client.checkStatus()        # Returns true if checkStatus worked, false if it failed
        except Exception as ex:
            log_error_msg(recordId, "Error: checkStatus() call failed - " + str(ex))
            continue

        if not status:
            log_error_msg(recordId, "There was an error checking the status of running modules!")
            continue

        log_info_msg("Status = " + str(client.status))


        if client.status == client.RUNNING:      # 1... 
            query_template = ("UPDATE " + dbSchema + ".mod_configs " 
                              "SET run_status_id = " + str(RUNNING) + ", status_text = %s " 
                              "WHERE id = %s" )
            cur.execute(query_template, (str(client.percentCompleted) + '% complete', recordId))
            db_conn.commit()

        elif client.status == client.FINISHED:   # 2
            mapfile = ""

            try:
                # Retrieve and save the data locally to disk, creating a mapfile in the process
                mapfile = client.generateMapFile()

                if mapfile is None:
                    log_error_msg(recordId, "Error: Got None back from generateMapFile()")
                    sys.exit(2)

            except Exception as ex:
                log_error_msg(recordId, "Error: generateMapFile() call failed - " + str(ex))
                continue

            url = baseMapServerUrl + mapfile

            try:
                # Update status in the database
                query_template = ("UPDATE " + dbSchema + ".mod_configs "                                         
                                  "SET run_status_id = " + str(FINISHED) + ", status_text = %s, run_ended = %s " 
                                  "WHERE id = %s" )

                cur.execute(query_template, (client.processErrorText, str(datetime.datetime.now()), recordId))
                       
                for r in client.dataSets:
                    
                    if r.dataType is r.TYPE_LITERAL:
                        
                        log_info_msg("Processing literal result " + r.name +  " = " + str(r.value) +  "...")
        
                        # Clean out any old results
                        query_template = ("DELETE FROM " + dbSchema + ".config_text_inputs "
                                          "WHERE mod_config_id = %s AND column_name = %s AND is_input = %s")
                        cur.execute(query_template, (recordId, r.name, False))      
        
        
                        # Insert fresh ones
                        query_template = ("INSERT INTO " + dbSchema + ".config_text_inputs "
                                          "     (mod_config_id, column_name, value, is_input) "
                                          "VALUES(%s, %s, %s, %s)")
                        cur.execute(query_template, (recordId, r.name, r.value, False))


                    else:
                        log_info_msg("Processing complex result " + r.name + " with id of " + r.uniqueID)
        
                        # Check if data server already exists in the database, otherwise insert it.  We need the record id
                        qcur.execute("SELECT id FROM " + dbSchema + ".dataservers WHERE url = %s", (url,))   # Trailing , needed
                        if qcur.rowcount == 0:
                            titleServ = "iGUESS results server"
                            abstract = "Server hosting the results of a module run"
                            qcur.execute(("INSERT INTO " + dbSchema + ".dataservers (url, title, abstract, alive, wms, wfs, wcs) "
                                          "VALUES(%s, %s, %s, %s, %s, %s, %s) RETURNING id"), 
                                                            (url, titleServ, abstract, True, True, True, True))
                        if qcur.rowcount == 0:
                            log_error_msg(recordId, "Error: Unable to insert record into dataservers table!")
                            continue
        
                        serverId = qcur.fetchone()[0]
                        
                        service = "WMS"
                        
                        if r.dataType == r.TYPE_VECTOR:
                            service = "WFS"
                        elif r.dataType == r.TYPE_RASTER:
                            service = "WCS"
        
                        query_template = ("INSERT INTO " + dbSchema + ".datasets                                     "
                                          "    (title, server_url, dataserver_id, identifier, abstract, city_id,     "
                                          "         alive, finalized, created_at, updated_at, service)               "
                                          "VALUES(                                                                   "
                                          "  (                                                                       "
                                          "      SELECT value FROM " + dbSchema + ".config_text_inputs               "
                                          "      WHERE mod_config_id = %s AND column_name = %s AND is_input = FALSE  "
                                          "  ),                                                                      "
                                          "   %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)                                "
                                          "RETURNING id")
        
                        abstract = "Result calculated with module"
                        
                        qcur.execute(query_template, (recordId, r.uniqueID, url, serverId, r.uniqueID, abstract, str(city_id), True, True, 
                                                     str(datetime.datetime.now()), str(datetime.datetime.now()), service) )
                        # For WCS datasets, need bounding box, and bbox srs, also 
        
                        if qcur.rowcount == 0:
                            log_error_msg(recordId, "Error: Unable to insert record into datasets table")
                            continue
        
                        insertedId = qcur.fetchone()[0]
        
                        # Insert mapping tag
                        qcur.execute("insert into " + dbSchema + ".dataset_tags(dataset_id, tag) values(" + str(insertedId) + ", 'Mapping')")

                db_conn.commit()

            except:
                log_error_msg(recordId, "Error: Last client status was " + str(client.status))
                continue    

        elif client.status == client.ERROR:    

            log_error_msg(recordId, "Error: " + str(client.processErrorText))
            continue


        else:
            log_error_msg(recordId, "Error: Unknown status " + str(client.status))
            continue


if __name__ == '__main__':
    main()