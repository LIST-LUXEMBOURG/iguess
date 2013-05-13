#!/usr/bin/python

from owslib.wps import WebProcessingService
from owslib.wfs import WebFeatureService
from owslib.wcs import WebCoverageService
from owslib.wms import WebMapService, ServiceException

import psycopg2          # For database access
import re

wpsVersion = '1.0.0'
wmsVersion = '1.3.0'
wfsVersion = '1.0.0'
wcsVersion = '1.1.0'

# Get the database connection info
from harvester_pwd import dbDatabase, dbName, dbUsername, dbPassword, dbSchema


# Connect to the database
dbConn   = psycopg2.connect(host = dbDatabase, database = dbName, user = dbUsername, password = dbPassword)
serverCursor = dbConn.cursor()      # For listing servers
updateCursor = dbConn.cursor()      # For updating the database
procCursor   = dbConn.cursor()      # For updating processes
dsCursor     = dbConn.cursor()      # For iterating over datasets and 


tables = { }
tables["wpsServers"]    = dbSchema + ".wps_servers"
tables["processes"]     = dbSchema + ".wps_processes"
tables["processParams"] = dbSchema + ".process_params"
tables["datasets"]      = dbSchema + ".datasets"
tables["dataservers"]   = dbSchema + ".dataservers"


# Create a database row if one is needed
def upsert(cursor, table, idCol, rowId, identifier):
    # This query will return the row's id if it finds a match, otherwise it will return nothing. 
    # We will check this with rowcount, below.
    cursor.execute("UPDATE " + table + " SET alive = TRUE WHERE " + idCol + " = %s AND identifier = %s RETURNING id",
                   (rowId, identifier))

    if(cursor.rowcount == 0):
        cursor.execute("INSERT INTO " + table + " (" + idCol + ", identifier) VALUES (%s, %s)",
                       (rowId, identifier))

# Mark all our records as dead; we'll mark them as alive as we process them.  Note that the database won't
# actually be udpated until we commit all our transactions at the end, so we'll never see this value
# for a server/process/input that is in fact alive.
updateCursor.execute("UPDATE " + tables["wpsServers"]    + " SET alive = false")
updateCursor.execute("UPDATE " + tables["processes"]     + " SET alive = false")
updateCursor.execute("UPDATE " + tables["processParams"] + " SET alive = false")

# Get the server list
serverCursor.execute("SELECT url, id FROM " + tables["wpsServers"])

for row in serverCursor:
    serverUrl = row[0]
    serverId  = row[1]

    # Run a GetCapabilities query on the WPS server -- could fail if URL is bogus
    try:
        wps = WebProcessingService(serverUrl, version = wpsVersion)
    except:  
        print "Could not load WPS data from url " + serverUrl
        # If URL is bogus, will raise a URLError... but whatever... no errors are reoverable at this point
        continue

    # Update the server title and abstract
    updateCursor.execute("UPDATE " + tables["wpsServers"] + " SET title = %s, abstract = %s, provider_name = %s,"
                         "contact_name = %s, contact_email = %s, last_seen = NOW(), alive = TRUE "
                         "WHERE id = %s", 
                         (wps.identification.title, wps.identification.abstract, wps.provider.name, 
                          wps.provider.contact.name, wps.provider.contact.email, serverId))


    # Iterate over the processes available on this server
    for proc in wps.processes: 

        # Do an upsert to establish the row, so we can update it. Not totally correct, 
        # but this will not be run where race conditions can develop.
        upsert(updateCursor, tables["processes"], "wps_server_id", serverId, proc.identifier)

        # Now we know that our row exists, and we can do a simple update to get the rest of the info in
        # We'll return the record id so that we can use it below.
        updateCursor.execute("UPDATE " + tables["processes"] + " SET title = %s, abstract = %s, last_seen = NOW(), alive = TRUE "
                             "WHERE wps_server_id = %s AND identifier = %s RETURNING id",
                             (proc.title, proc.abstract, serverId, proc.identifier))

        # print dir(updateCursor.fetchone())
        procId = updateCursor.fetchone()[0]

        procDescr = wps.describeprocess(proc.identifier)

        for input in procDescr.dataInputs:

            abstract = ""
            if hasattr(input, "abstract"):
                abstract = input.abstract

            datatype = ""
            if hasattr(input, "dataType"):
                datatype = input.dataType

            if datatype and datatype.startswith("//www.w3.org/TR/xmlschema-2/#"):
                datatype = datatype.replace("//www.w3.org/TR/xmlschema-2/#", "")


            upsert(updateCursor, tables["processParams"], "wps_process_id", procId, input.identifier)
            updateCursor.execute("UPDATE " + tables["processParams"] + " SET title = %s, abstract = %s, datatype = %s, "
                                 "is_input = TRUE, alive = TRUE, last_seen = NOW() "
                                 "WHERE wps_process_id = %s AND identifier = %s",
                                 (input.title, abstract, datatype, procId, input.identifier))

        for output in procDescr.processOutputs:

            abstract = ""
            if hasattr(output, 'abstract'):
                abstract = output.abstract

            datatype = ""
            if hasattr(output, "dataType"):
                datatype = output.dataType

            if datatype and datatype.startswith("//www.w3.org/TR/xmlschema-2/#"):
                datatype = datatype.replace("//www.w3.org/TR/xmlschema-2/#", "")


            upsert(updateCursor, tables["processParams"], "wps_process_id", procId, output.identifier)
            updateCursor.execute("UPDATE " + tables["processParams"] + " SET title = %s, abstract = %s, datatype = %s, "
                                 "is_input = FALSE, alive = TRUE, last_seen = NOW() "
                                 "WHERE wps_process_id = %s AND identifier = %s",
                                 (output.title, abstract, datatype, procId, output.identifier))

# Commit WPS transactions
dbConn.commit() 


# Now check on the dataservers and datasets, first marking them all as defunct
updateCursor.execute("UPDATE " + tables["datasets"]    + " SET alive = false")
updateCursor.execute("UPDATE " + tables["dataservers"] + " SET alive = false")

# Get the server list
serverCursor.execute("SELECT DISTINCT url FROM " + tables["dataservers"])
for row in serverCursor:
    serverUrl = row[0]

    try:        
        wms = WebMapService(serverUrl, version = wmsVersion)
    except:
        wms = None

    try:
        wfs = WebFeatureService(serverUrl, version = wfsVersion)
    except:
        wfs = None

    try:
        wcs = WebCoverageService(serverUrl, version = wcsVersion)
    except: 
        wcs = None

    if not (wms or wfs or wcs):
        continue

    dstitle = dsabstr = None

    dstitle = wms and wms.identification.title    or wfs and wfs.identification.title    or wcs and wcs.identification.title    or "Unnamed server"
    dsabstr = wms and wms.identification.abstract or wfs and wfs.identification.abstract or wcs and wcs.identification.abstract or ""

    hasWms = True if wms else False
    hasWfs = True if wfs else False
    hasWcs = True if wcs else False

    updateCursor.execute("UPDATE " + tables["dataservers"] + " " +
                 "SET title = %s, abstract = %s, alive = TRUE, last_seen = NOW(), wms = %s, wfs = %s, wcs = %s " +
                 "WHERE url = %s", (dstitle, dsabstr, hasWms, hasWfs, hasWcs, serverUrl))


    # Trailing comma needed in line below because Python tuples can't have just one element...
    dsCursor.execute("select distinct(identifier) from " + tables["datasets"] + " where server_url = %s", (serverUrl,))

    for dsrow in dsCursor:
        identifier = unicode(dsrow[0], 'utf8')

        dsid = dstitle = dsabstr = None

        found = True

        # from lxml import etree
        # if wms:
        #     print dir(wms)
        #     etree.dump(wms._capabilities)

        if wms and identifier in wms.contents:
            dstitle = wms.contents[identifier].title.encode('utf8')    if wms.contents[identifier].title    else ""
            dsabstr = wms.contents[identifier].abstract.encode('utf8') if wms.contents[identifier].abstract else ""

        elif wfs and identifier in wfs.contents:
            dstitle = wfs.contents[identifier].title.encode('utf8')    if wfs.contents[identifier].title    else ""
            dsabstr = wfs.contents[identifier].abstract.encode('utf8') if wfs.contents[identifier].abstract else ""

        elif wcs and identifier in wcs.contents:
            dstitle = wcs.contents[identifier].title.encode('utf8')    if wcs.contents[identifier].title    else ""
            dsabstr = wcs.contents[identifier].abstract.encode('utf8') if wcs.contents[identifier].abstract else ""

        else:
            print "Not found: " + identifier.encode('utf8') + " (on server " +  serverUrl + ")"
            found = False

        if found:
            # Update the database with the layer info
            updateCursor.execute("UPDATE " + tables["datasets"] + " " +
                                 "SET title = %s, abstract = %s, alive = TRUE, last_seen = NOW() " +
                                 "WHERE server_url = %s AND identifier = %s", (dstitle, dsabstr, serverUrl, identifier))

# Commit dataset transactions
dbConn.commit() 

# Close all cursors/connections
procCursor.close()
serverCursor.close()
dsCursor.close()
updateCursor.close()
dbConn.close()