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
db_conn = None

############################################################


def config_logging(logfile, loglevel):
    '''
    Set up the logging file
    '''

    format = "[%(asctime)s] %(levelname)s: %(message)s"
    logging.basicConfig(filename=logfile, level=loglevel, format=format)



def initialize_database_connection():
    global db_conn

    try:
        connstr = ("dbname='" + dbName + "' user='" + dbUsername +"' " +
                   "host='" + dbServer + "' password='" + dbPassword + "'")
        db_conn = psycopg2.connect(connstr)
        db_conn.set_session(autocommit=True)
    except:
        # Can't log error message until logging is configured, which requires a db connection.  What do do!
        # log_error_msg(None, "Database Error: Can't connect to database " + dbName + "!")
        sys.exit(2)



def update_run_status_in_database(recordId, status, msg):
    cur = db_conn.cursor()

    query_template = ("UPDATE " + dbSchema + ".mod_configs " 
                      "SET run_status_id = %s, status_text = %s, run_ended = %s " 
                      "WHERE id = %s" )

    try:
        cur.execute(query_template, (status, msg, datetime.datetime.now(), recordId))
    except Exception as ex:
        logging.error("Database error: Could not update status; " + str(ex))



def log_error_msg(recordId, msg):
    ''' 
    Write an error message into the databse in a way that will cause it to appear in iGUESS UI 
    '''

    if(recordId):
        update_run_status_in_database(recordId, ERROR, msg)

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
    cur = db_conn.cursor()

    global RUNNING, FINISHED, ERROR

    cur.execute("SELECT id, status FROM " + dbSchema + ".run_statuses "
                "WHERE status IN ('RUNNING', 'FINISHED', 'ERROR')")

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



def get_running_process_list():
    '''
    Return a list of processes that the database thinks are running. 
    '''
    cur = db_conn.cursor()

    try:
        query = ("SELECT mc.id, pid, c.srs, c.id "                              
                 "FROM " + dbSchema + ".mod_configs AS mc "                     
                 "LEFT JOIN " + dbSchema + ".cities AS c ON c.id = mc.city_id " 
                 "WHERE run_status_id = %s")
                
        cur.execute(query, (RUNNING,))      # Trailing comma required

    except:
        log_error_msg(None, "Error: Can't retrieve list of running processes from database!")
        sys.exit(2)

    rows = cur.fetchall()

    return rows



def get_output_identifiers(recordId):
    '''
    Get a list of identifiers of all outputs this module expects will be produced
    '''
    cur = db_conn.cursor()

    identifiers = {}

    try:
        cur.execute("SELECT column_name, value FROM " + dbSchema + ".config_text_inputs "
                    "WHERE mod_config_id = %s AND is_input = False",
                    (recordId,))     # Trailing comma required
    except:
        return None

    outs = cur.fetchall()
    for out in outs:
        identifiers[out[0]] = out[1]

    return identifiers 



def normalize_srs(srs):
    '''
    Convert srs into a consistent format
    '''
    if srs.startswith("EPSG:"):          # Strip prefix, if there is one
        return srs[5:]

    return srs



def validate_process_params(recordId, pid, srs):
    '''
    Check for bad records that will cause crashy-crashy
    Returns True if things look OK, False if there is a problem
    '''
    if pid is None:
        log_info_msg(recordId, "Found missing pid in record with id " + str(recordId))
        return False

    if srs is None:
        log_info_msg(recordId, "Found missing srs in record with id " + str(recordId))
        return False

    return True



def update_running_module(client, recordId):
    '''
    Update the status of a running module with the latest progress reported by the WPS server
    '''
    update_run_status_in_database(recordId, RUNNING, str(client.percentCompleted) + '% complete')



def get_service(dataset):
    '''
    Return the service name for the passed dataset
    '''
    if dataset.dataType == dataset.TYPE_VECTOR:
        return "WFS"
    elif dataset.dataType == dataset.TYPE_RASTER:
        return "WCS"
    else:
        return "WMS"



def insert_new_dataset(dataset, recordId, url, serverId, city_id, epsg):
    '''
    Insert a new dataset into our database; returns id of inserted record
    '''
    cur = db_conn.cursor()

    query_template = ("INSERT INTO " + dbSchema + ".datasets                                        "
                      "    (title, server_url, dataserver_id, identifier, abstract, city_id,        "
                      "         alive, finalized, created_at, updated_at, service,                  "
                      "         bbox_left, bbox_bottom, bbox_right, bbox_top, format, last_seen,    "
                      "         resolution_x, resolution_y, local_srs, bbox_srs)                    "
                      "VALUES(                                                                      "
                      "  (                                                                          "
                      "      SELECT value FROM " + dbSchema + ".config_text_inputs                  "
                      "      WHERE mod_config_id = %s AND column_name = %s AND is_input = FALSE     "
                      "  ),                                                                         "
                      " %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) "
                      "RETURNING id")

    abstract = "Result calculated with module"

    xl,yl,xh,yh = dataset.getBBox()  # This is the bbox in the native coordinate system

    # These params will be different for vectors and rasters
    if dataset.dataType == dataset.TYPE_RASTER:
        raster_res_x, raster_res_y = dataset.getPixelRes()
        format = dataset.getMimeType()
    else:
        raster_res_x = raster_res_y = format = None


    now = datetime.datetime.now()

    cur.execute(query_template, (recordId, dataset.uniqueID, url, serverId, dataset.uniqueID, abstract, 
                                 city_id, True, True, now, now,
                                 get_service(dataset), xl, yl, xh, yh, format, now, raster_res_x, raster_res_y,
                                 True, "EPSG:" + str(epsg) ))

    if cur.rowcount == 0:
        log_error_msg(recordId, "Error: Unable to insert record into datasets table")
        return

    return cur.fetchone()[0]



def insert_literal_value_in_database(recordId, dataset):
    cur = db_conn.cursor()

    # Clean out any old results
    cur.execute("DELETE FROM " + dbSchema + ".config_text_inputs "
                "WHERE mod_config_id = %s AND column_name = %s AND is_input = %s",
                (recordId, dataset.name, False))      

    # Insert fresh ones
    cur.execute("INSERT INTO " + dbSchema + ".config_text_inputs "
                "     (mod_config_id, column_name, value, is_input) "
                "VALUES(%s, %s, %s, %s)",
                (recordId, dataset.name, dataset.value, False))



def add_tag(dataset_id, tag):
    cur = db_conn.cursor()

    try:
        # Avoid duplicate tags by deleting any existing tags with same value
        cur.execute("DELETE FROM " + dbSchema + ".dataset_tags WHERE dataset_id = %s AND tag = %s",
                    (dataset_id, tag))  

        # Insert the new tag
        cur.execute("INSERT INTO " + dbSchema + ".dataset_tags(dataset_id, tag) VALUES(%s, %s)",
                    (dataset_id, tag))    
    except:
        log_error_msg("Could not insert tag for dataset " + str(dataset_id) + " and value " + tag)



def insert_complex_value_in_database(recordId, dataset, url, city_id, epsg):
    '''
    Returns False if there was a problem with the database
    '''
    cur = db_conn.cursor()

    # Check if data server already exists in the database, otherwise insert it.  We need the record id.
    cur.execute("SELECT id FROM " + dbSchema + ".dataservers WHERE url = %s", (url,))   # Trailing comma needed

    if cur.rowcount == 0:      # Not found; insert it!
        title    = "iGUESS results server"
        abstract = "Server hosting the results of a module run"

        cur.execute("INSERT INTO " + dbSchema + ".dataservers (url, title, abstract, alive, wms, wfs, wcs) "
                    "VALUES(%s, %s, %s, %s, %s, %s, %s) RETURNING id", 
                    (url, title, abstract, True, True, True, True))

    if cur.rowcount == 0:
        log_error_msg(recordId, "Error: Unable to insert record into dataservers table!")
        return False

    server_id = cur.fetchone()[0]
   
    dataset_id = insert_new_dataset(dataset, recordId, url, server_id, city_id, epsg)

    add_tag(dataset_id, "Mapping")

    return True



def update_finished_module(client, recordId, city_id):
    '''
    Update the database after a module has finished running
    '''
    try:
        # Retrieve and save the data locally to disk, creating a mapfile in the process
        mapfile = client.generateMapFile()

        if mapfile is None:
            log_error_msg(recordId, "Error: Got None back from generateMapFile()")
            return

    except Exception as ex:
        log_error_msg(recordId, "Error: generateMapFile() call failed - " + str(ex))
        return

    url = baseMapServerUrl + mapfile

    update_run_status_in_database(recordId, FINISHED, client.processErrorText)

    try:
        for dataset in client.dataSets:
            if dataset.dataType is dataset.TYPE_LITERAL:
                log_info_msg("Processing literal result " + dataset.name +  " = " + str(dataset.value) +  "...")
                insert_literal_value_in_database(recordId, dataset)

            else:
                log_info_msg("Processing complex result " + dataset.name + " with id of " + dataset.uniqueID)
                insert_complex_value_in_database(recordId, dataset, url, city_id, client.epsg)
    except:
        log_error_msg(recordId, "Error: Last client status was " + str(client.status))



def main():
    global RUNNING, FINISHED, ERROR

    initialize_database_connection()
    config_logging(logFileName, logLevel)

    # Define constants for communication between different sotware bits
    
    RUNNING, FINISHED, ERROR = get_running_finished_error_vals()

    try:
        client = WPSClient.WPSClient()
    except Exception as ex:
        log_error_msg(None, "Error: Could not initialize WPSClient module - " + str(ex))


    # Grab a list of processes that the database thinks are running.  We'll cycle through these
    # to check their progress/status.
    processes = get_running_process_list()

    for process in processes:
        recordId, pid, srs, city_id = process

        if not validate_process_params(recordId, pid, srs):
            continue

        log_info_msg("Checking pid " + str(pid) + "...")

        identifiers = get_output_identifiers(recordId)

        if identifiers is None:
            logging.warning("Can't get params for config id " + str(recordId))
            continue

        try:
            client.initFromURL(pid, identifiers)
        except Exception as ex:
            log_error_msg(recordId, "Error: initFromURL() call failed - " + str(ex))
            continue

        client.epsg = normalize_srs(srs)   

        try:
            status = client.checkStatus()        # Returns true if checkStatus worked, false if it failed
        except Exception as ex:
            log_error_msg(recordId, "Error: checkStatus() call failed - " + str(ex))
            continue

        if not status:
            log_error_msg(recordId, "There was an error checking the status of running modules!")
            continue

        log_info_msg("client.checkStatus() returned: " + str(client.status))


        if client.status == client.RUNNING:      # 1... 
            update_running_module(client, recordId)

        elif client.status == client.FINISHED:   # 2
            update_finished_module(client, recordId, city_id)

        elif client.status == client.ERROR:    
            log_error_msg(recordId, "Error: " + str(client.processErrorText))

        else:
            log_error_msg(recordId, "Error: Unknown status -- " + str(client.status))


if __name__ == '__main__':
    main()
