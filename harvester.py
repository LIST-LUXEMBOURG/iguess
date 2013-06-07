#!/usr/bin/python

from owslib.wps import WebProcessingService
from owslib.wfs import WebFeatureService
from owslib.wcs import WebCoverageService
from owslib.wms import WebMapService, ServiceException

from pyproj import transform, Proj

import psycopg2          # For database access
import re
import math

wpsVersion = '1.0.0'
wmsVersion = '1.1.0'        # Rotterdam wms doesn't like 1.3.0!
wfsVersion = '1.1.0'
wcsVersion = '1.1.0'        # Rotterdam only works when this is set to 1.1.0

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
tables["cities"]        = dbSchema + ".cities"

# serverUrl = 'http://ows.gis.rotterdam.nl/cgi-bin/mapserv.exe?map=d:\gwr\webdata\mapserver\map\gwr_basis_pub.map'
# wcs = WebCoverageService(serverUrl, version = wcsVersion)


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


# Build a list of native CRS's for the cities
# Creates:
# {2: 'urn:ogc:def:crs:EPSG::31370', 3: 'urn:ogc:def:crs:EPSG::31467', 4: 'urn:ogc:def:crs:EPSG::2154', 5: 'urn:ogc:def:crs:EPSG::28992'}
cityCRS = {}
serverCursor.execute("SELECT id, srs FROM " + tables["cities"])
for row in serverCursor:
    cityCRS[row[0]] = row[1]


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
            if hasattr(output, "abstract"):
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


# Compare whether two crs's are in fact the same.  We'll consider the following two strings equal
# urn:ogc:def:crs:EPSG::28992
# EPSG:28992
def isEqualCrs(first, second):
    # Frist, replace the :: with a single :
    first = first.replace('::', ':')
    second = second.replace('::', ':')

    # Now split on a ':', lowercasing to remove case considerations, so we can compare the last two tokens
    firstWords = first.lower().split(':')
    secondWords = second.lower().split(':')
    
    return firstWords[len(firstWords) - 2] == secondWords[len(secondWords) - 2] and firstWords[len(firstWords) - 1] == secondWords[len(secondWords) - 1]



def projectWgsToLocal(boundingBox, localProj):
    print "BB", boundingBox[0], boundingBox[1], boundingBox[2], boundingBox[3]

    p1 = Proj(init='EPSG:4326')     # WGS84
    p2 = Proj(init=localProj)

    bboxLeft,  bboxBottom = transform(p1, p2, boundingBox[0], boundingBox[1])
    bboxRight, bboxTop    = transform(p1, p2, boundingBox[2], boundingBox[3])

    return bboxLeft,  bboxBottom, bboxRight, bboxTop



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

    # wms: ['__class__', '__delattr__', '__dict__', '__doc__', '__format__', '__getattribute__', '__getitem__', '__hash__', '__init__', '__module__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', '_buildMetadata', '_capabilities', '_getcapproperty', 'contents', 'exceptions', 'getOperationByName', 'getServiceXML', 'getcapabilities', 'getfeatureinfo', 'getmap', 'identification', 'items', 'operations', 'password', 'provider', 'url', 'username', 'version']
    # wfs: ['__class__', '__delattr__', '__dict__', '__doc__', '__format__', '__getattribute__', '__getitem__', '__hash__', '__init__', '__module__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', '_buildMetadata', '_capabilities', 'contents', 'exceptions', 'getOperationByName', 'getcapabilities', 'getfeature', 'identification', 'items', 'log', 'operations', 'provider', 'url', 'version']
    # wfs.contents: ['__class__', '__cmp__', '__contains__', '__delattr__', '__delitem__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__getitem__', '__gt__', '__hash__', '__init__', '__iter__', '__le__', '__len__', '__lt__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__setitem__', '__sizeof__', '__str__', '__subclasshook__', 'clear', 'copy', 'fromkeys', 'get', 'has_key', 'items', 'iteritems', 'iterkeys', 'itervalues', 'keys', 'pop', 'popitem', 'setdefault', 'update', 'values', 'viewitems', 'viewkeys', 'viewvalues']

    # if(wfs):  
    #     print dir(wfs.contents)

    updateCursor.execute("UPDATE " + tables["dataservers"] + " " +
                 "SET title = %s, abstract = %s, alive = TRUE, last_seen = NOW(), wms = %s, wfs = %s, wcs = %s " +
                 "WHERE url = %s", (dstitle, dsabstr, hasWms, hasWfs, hasWcs, serverUrl))


    # Trailing comma needed in line below because Python tuples can't have just one element...
    dsCursor.execute("select id, identifier, city_id from " + tables["datasets"] + " where server_url = %s", (serverUrl,))

    for dsrow in dsCursor:
        dsid = dsrow[0]
        identifier = dsrow[1]
        cityId = dsrow[2]

        dstitle = dsabstr = None

        found = True
        hasCityCRS = False
        imgFormat  = ""
        bboxLeft   = ""
        bboxRight  = ""
        bboxTop    = ""
        bboxBottom = ""
        resX       = 0
        resY       = 0

        # from lxml import etree
        # if wms:
        #     print dir(wms)
        #     etree.dump(wms._capabilities)
        print identifier        #{P{P}}

        found = False;

        if wfs and identifier in wfs.contents:
            found = True;
            dstitle = wfs.contents[identifier].title.encode('utf8')    if wfs.contents[identifier].title    else identifier.encode('utf8')
            dsabstr = wfs.contents[identifier].abstract.encode('utf8') if wfs.contents[identifier].abstract else ""

            # Check if dataset is available in the city's local srs
            for c in wfs.contents[identifier].crsOptions:
                if isEqualCrs(c.id, cityCRS[cityId]):
                    hasCityCRS = True
                    break

            # No more bounding box for wfs now that Christian has fixed the mapserver config file
            # bb = wfs.contents[identifier].boundingBoxWGS84
            # bboxLeft, bboxBottom, bboxRight, bboxTop = projectWgsToLocal(bb, cityCRS[cityId])

        if wcs and identifier in wcs.contents:
            found = True;
            dstitle = wcs.contents[identifier].title.encode('utf8')    if wcs.contents[identifier].title    else identifier.encode('utf8')
            dsabstr = wcs.contents[identifier].abstract.encode('utf8') if wcs.contents[identifier].abstract else ""

            for c in wcs.contents[identifier].supportedCRS:     # crsOptions is available here, but always empty; only exists for OOP
                if isEqualCrs(c.id, cityCRS[cityId]):
                    hasCityCRS = True
                    break

            dc = wcs.getDescribeCoverage(identifier)
            gridOffsets = dc.find(".//{http://www.opengis.net/wcs/1.1}GridOffsets") 
            if gridOffsets is None:
                dc.find(".//{http://www.opengis.net/wcs}GridOffsets")

            if(gridOffsets is None):
                print "Can't find GridOffsets for WCS dataset " + serverUrl + " >>> " + identifier
                continue
            else:
                resX, resY = gridOffsets.text.split()
                if(float(resX) < 0):
                    resX = float(resX) * -1
                if(float(resY) < 0):
                    resY = float(resY) * -1


            if(len(wcs.contents[identifier].supportedFormats[0]) == 0):
                print "Cannot get a supported format for WCS dataset " + serverUrl + " >>> " + identifier
                continue
            else:
                index = 0
                if 'image/img' in wcs.contents[identifier].supportedFormats[index].lower():
                    index = wcs.contents[identifier].supportedFormats.index('image/img')    # This is our preferred format; use it if available
                elif 'image/tiff' in wcs.contents[identifier].supportedFormats[index].lower():
                    index = wcs.contents[identifier].supportedFormats.index('image/tiff')   # Second choice is tiff
                imgFormat = wcs.contents[identifier].supportedFormats[index]

                bb = wcs.contents[identifier].boundingBoxWGS84
                bboxLeft, bboxBottom, bboxRight, bboxTop = projectWgsToLocal(bb, cityCRS[cityId])

        if wms and identifier in wms.contents:
            found = True;
            dstitle = wms.contents[identifier].title.encode('utf8')    if wms.contents[identifier].title    else identifier.encode('utf8')
            dsabstr = wms.contents[identifier].abstract.encode('utf8') if wms.contents[identifier].abstract else ""


        if found:
            # Update the database with the layer info
            updateCursor.execute("                                                                                                     \
                         UPDATE " + tables["datasets"] + "                                                                             \
                         SET title = %s, abstract = %s, alive = TRUE, last_seen = NOW(), local_srs = %s, format = %s, bbox_left = %s,  \
                                 bbox_right = %s, bbox_top = %s, bbox_bottom = %s, resolution_x = %s, resolution_y = %s                \
                         WHERE id = %s                                                                                                 \
                         ", (dstitle, dsabstr, hasCityCRS, imgFormat, bboxLeft, bboxRight, bboxTop, bboxBottom, resX, resY, dsid))
        else:
             print "Not found: " + identifier + " (on server " +  serverUrl + ")"

# Commit dataset transactions
dbConn.commit() 

# Close all cursors/connections
procCursor.close()
serverCursor.close()
dsCursor.close()
updateCursor.close()
dbConn.close()