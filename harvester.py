#!/usr/bin/python

# Harvester of Sorrow

from owslib.wps import WebProcessingService
from owslib.wfs import WebFeatureService
from owslib.wcs import WebCoverageService
from owslib.wms import WebMapService, ServiceException

# Download source from http://code.google.com/p/pyproj/downloads/list, follow instructions in README
from pyproj import transform, Proj

import psycopg2          # For database access
from psycopg2.extensions import adapt  # adapt gives us secure qutoing
import time
import datetime
import string

wpsVersion = '1.0.0'
wmsVersion = '1.1.1'        # Rotterdam wms doesn't like 1.3.0!
wfsVersion = '1.0.0'        # Montreuil only works with 1.0.0
wcsVersion = '1.1.0'        # Rotterdam only works when this is set to 1.1.0


# Create a database row if one is needed
def upsert(cursor, table, idCol, rowId, identifier):
    # This query will return the row's id if it finds a match, otherwise it will return nothing. 
    # We will check this with rowcount, below.
    cursor.execute("UPDATE " + table + " SET alive = TRUE WHERE " + idCol + " = %s AND identifier = %s RETURNING id",
                   (rowId, identifier))

    if(cursor.rowcount == 0):
        cursor.execute("INSERT INTO " + table + " (" + idCol + ", identifier) VALUES (%s, %s)",
                       (rowId, identifier))


def convert_encoding(data, new_coding='UTF-8'):
    # More here: http://www.postgresql.org/docs/9.1/static/multibyte.html
    codings = ["UTF-8", "latin1", "latin2", "latin3", "latin4", "latin5", "latin6", "latin7", "latin8", "latin9", "latin10", "ascii"]
    ok = False

    for coding in codings:
        try:
            data = unicode(data, coding).encode(new_coding)
            ok = True
            break
        except:
            continue


    if not ok:
        print "Could not find a unicode coding for string " + data

    return data


def doSql(conn, cursor, upsertList, sqlList):

    conn.set_session(autocommit=False)

    try:
        for up in upsertList:
            upsert(cursor, up[0], up[1], up[2], up[3])

        for sql in sqlList:
            try:
                sql = convert_encoding(sql)
                # sql = unicode(sql, "latin-1")
                cursor.execute(sql)
                conn.commit()

            except Exception as e:
                print "-----"
                print "Error running SQL:"
                print sql
                print "-----"
                print type(e)
                print e.args
                print e
                print "-----"
                conn.rollback()

        conn.commit()


    except Exception as e:
        print "-----"
        print "Error running SQL:"
        print sqlList
        print "-----"
        print type(e)
        print e.args
        print e
        print "-----"
        conn.rollback()

    conn.set_session(autocommit=True)
    


def checkWPS(serverCursor):
    # Get the server list, but ignore servers marked as deleted
    serverCursor.execute("SELECT url, id FROM " + tables["wpsServers"] + " WHERE deleted = false")

    upsertList = []
    sqlList = []

    # Mark all our records as dead; we'll mark them as alive as we process them.  Note that the database won't
    # actually be udpated until we commit all our transactions at the end, so we'll never see this value
    # for a server/process/input that is in fact alive.
    sqlList.append("UPDATE " + tables["wpsServers"]    + " SET alive = false")
    sqlList.append("UPDATE " + tables["processes"]     + " SET alive = false")
    sqlList.append("UPDATE " + tables["processParams"] + " SET alive = false")

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
        sqlList.append(
                        "UPDATE " + tables["wpsServers"] + " "
                        "SET title = "         + str(adapt(wps.identification.title))    + ", "
                            "abstract = "      + str(adapt(wps.identification.abstract)) + ", "
                            "provider_name = " + str(adapt(wps.provider.name))           + ", "
                            "contact_name = "  + str(adapt(wps.provider.contact.name))   + ", "
                            "contact_email = " + str(adapt(wps.provider.contact.email))  + ", "
                            "last_seen = NOW(), alive = TRUE "
                        "WHERE id = " + str(adapt(serverId))
                      )

        # Iterate over the processes available on this server
        for proc in wps.processes: 

            # Do an upsert to establish the row, so we can update it. Not totally correct, 
            # but this will not be run where race conditions can develop.
            upsertList.append((tables["processes"], "wps_server_id", serverId, proc.identifier))

            # Now we know that our row exists, and we can do a simple update to get the rest of the info in
            # We'll return the record id so that we can use it below.

            whereClause = "WHERE wps_server_id = " + str(adapt(serverId)) + " AND identifier = " + str(adapt(proc.identifier))
            
            if hasattr(proc, 'abstract'):
                abstract = proc.abstract
            else:
                abstract = ""

            sqlList.append(
                            "UPDATE " + tables["processes"] + " "
                            "SET title = " + str(adapt(proc.title)) + ", "
                                "abstract = " + str(adapt(abstract)) + ", "
                                "last_seen = NOW(), alive = TRUE " +
                            whereClause
                          )

            # Need to do this here so that the SELECT below will find a record if the upsert inserts... a little messy
            doSql(dbConn, updateCursor, upsertList, sqlList)
            upsertList = []
            sqlList = []

            updateCursor.execute("SELECT id FROM " + tables["processes"] + " " + whereClause)

            procId = updateCursor.fetchone()[0]

            try:
                procDescr = wps.describeprocess(proc.identifier)
            except:
                print "Could not describe process ", proc.identifier, " on server ", serverUrl

            for input in procDescr.dataInputs:

                abstract = ""
                if hasattr(input, "abstract"):
                    abstract = input.abstract

                datatype = ""
                if hasattr(input, "dataType"):
                    datatype = input.dataType
                    if datatype is None:
                        datatype = "" 

                if datatype and datatype.startswith("//www.w3.org/TR/xmlschema-2/#"):
                    datatype = datatype.replace("//www.w3.org/TR/xmlschema-2/#", "")

                upsertList.append((tables["processParams"], "wps_process_id", procId, input.identifier))
                sqlList.append(
                                "UPDATE " + tables["processParams"] + " "
                                "SET title = " + str(adapt(input.title)) + ","
                                    "abstract = " + str(adapt(abstract)) + ", "
                                    "datatype = " + str(adapt(datatype)) + ", "
                                    "is_input = TRUE, alive = TRUE, last_seen = NOW() "
                                "WHERE wps_process_id = " + str(adapt(procId)) + " AND identifier = " + str(adapt(input.identifier))
                              )

            for output in procDescr.processOutputs:

                abstract = ""
                if hasattr(output, "abstract"):
                    abstract = output.abstract

                datatype = ""
                if hasattr(output, "dataType"):
                    if output.dataType:     # This can sometimes be None... bug in owslib?
                        datatype = output.dataType
                    else:
                        print output.identifier, serverUrl


                if datatype and datatype.startswith("//www.w3.org/TR/xmlschema-2/#"):
                    datatype = datatype.replace("//www.w3.org/TR/xmlschema-2/#", "")


                upsertList.append((tables["processParams"], "wps_process_id", procId, output.identifier))
                sqlList.append(
                                "UPDATE " + tables["processParams"] + " "
                                "SET title = " + str(adapt(output.title)) + ", "
                                    "abstract = " + str(adapt(abstract)) + ", "
                                    "datatype = " + str(adapt(datatype)) + ", "
                                    "is_input = FALSE, alive = TRUE, last_seen = NOW() "
                                "WHERE wps_process_id = " + str(adapt(procId)) + " AND identifier = " + str(adapt(output.identifier))
                              )

    # Run and commit WPS transactions
    doSql(dbConn, updateCursor, upsertList, sqlList)


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
    p1 = Proj(init='EPSG:4326')     # WGS84
    p2 = Proj(init=localProj)

    bboxLeft,  bboxBottom = transform(p1, p2, boundingBox[0], boundingBox[1])
    bboxRight, bboxTop    = transform(p1, p2, boundingBox[2], boundingBox[3])

    print "Transforming:"
    print localProj, bboxLeft,  bboxBottom ,"= transform(p1, p2, ",boundingBox[0],",", boundingBox[1],")"
    print localProj, bboxRight, bboxTop ,"= transform(p1, p2, ",boundingBox[2], ",", boundingBox[3],")"

    return bboxLeft,  bboxBottom, bboxRight, bboxTop



def checkDataServers(serverCursor):
    # Get the server list
    serverCursor.execute("SELECT DISTINCT url FROM " + tables["dataservers"])

    for row in serverCursor:
        upsertList = []     # Records to be created if they don't already exist
        sqlList = []        # Statements to be run once we're sure the relevant records exist
        
        serverUrl = row[0]
        print "Processing server ", serverUrl

        try:
            # Now check on the dataservers and datasets, first marking them all as defunct
            sqlList.append("UPDATE " + tables["datasets"] + " SET alive = false "
                              "WHERE EXISTS ( "
                                "SELECT * FROM " + tables["dataservers"] + " "
                                 "WHERE dataservers.id = datasets.dataserver_id "
                                 "AND dataservers.url = '" + serverUrl + "'"
                               ")"
                  );
            sqlList.append("UPDATE " + tables["dataservers"] + " SET alive = false WHERE url = '" + serverUrl + "'")

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

            dstitle = convert_encoding(wms and wms.identification.title or 
                                       wfs and wfs.identification.title or 
                                       wcs and wcs.identification.title or 
                                       "Unnamed server" )

            dsabstr = convert_encoding(wms and wms.identification.abstract or 
                                       wfs and wfs.identification.abstract or 
                                       wcs and wcs.identification.abstract or 
                                       "")
        except Exception as e:
            print "Error reading data from server " + serverUrl
            print wms, wfs, wcs
            continue

        try:
            hasWms = True if wms else False
            hasWfs = True if wfs else False
            hasWcs = True if wcs else False

            # wms: ['__class__', '__delattr__', '__dict__', '__doc__', '__format__', '__getattribute__', '__getitem__', '__hash__', '__init__', '__module__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', '_buildMetadata', '_capabilities', '_getcapproperty', 'contents', 'exceptions', 'getOperationByName', 'getServiceXML', 'getcapabilities', 'getfeatureinfo', 'getmap', 'identification', 'items', 'operations', 'password', 'provider', 'url', 'username', 'version']
            # wfs: ['__class__', '__delattr__', '__dict__', '__doc__', '__format__', '__getattribute__', '__getitem__', '__hash__', '__init__', '__module__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__sizeof__', '__str__', '__subclasshook__', '__weakref__', '_buildMetadata', '_capabilities', 'contents', 'exceptions', 'getOperationByName', 'getcapabilities', 'getfeature', 'identification', 'items', 'log', 'operations', 'provider', 'url', 'version']
            # wfs.contents: ['__class__', '__cmp__', '__contains__', '__delattr__', '__delitem__', '__doc__', '__eq__', '__format__', '__ge__', '__getattribute__', '__getitem__', '__gt__', '__hash__', '__init__', '__iter__', '__le__', '__len__', '__lt__', '__ne__', '__new__', '__reduce__', '__reduce_ex__', '__repr__', '__setattr__', '__setitem__', '__sizeof__', '__str__', '__subclasshook__', 'clear', 'copy', 'fromkeys', 'get', 'has_key', 'items', 'iteritems', 'iterkeys', 'itervalues', 'keys', 'pop', 'popitem', 'setdefault', 'update', 'values', 'viewitems', 'viewkeys', 'viewvalues']

            sqlList.append( "UPDATE " + tables["dataservers"] + " "
                            "SET title = " + str(adapt(dstitle)) + ", "
                                "abstract = " + str(adapt(dsabstr)) + ", "
                                "alive = TRUE, "
                                "last_seen = NOW(), "
                                "wms = " + str(adapt(hasWms)) + ", "
                                "wfs = " + str(adapt(hasWfs)) + ", "
                                "wcs = " + str(adapt(hasWcs)) + " "
                            "WHERE url = " + str(adapt(serverUrl))
                          )

            sql = "SELECT d.id, d.identifier, d.city_id FROM " + tables["datasets"] + " AS d " \
                  "LEFT JOIN " + tables["dataservers"] + " AS ds ON d.dataserver_id = ds.id "  \
                  "WHERE ds.url = '" + serverUrl + "'"

            # Trailing comma needed in line below because Python tuples can't have just one element...
            dsCursor.execute(sql)

            print sql

            print "Rows --> ",dsCursor.rowcount


            for dsrow in dsCursor:
                dsid       = dsrow[0]
                identifier = dsrow[1]
                cityId     = dsrow[2]

                dstitle = dsabstr = None

                found = True
                hasCityCRS = False
                imgFormat  = ""
                bboxLeft   = None
                bboxRight  = None
                bboxTop    = None
                bboxBottom = None
                resX       = 0
                resY       = 0

                # from lxml import etree
                # if wms:
                #     print dir(wms)
                #     etree.dump(wms._capabilities)
                found = False;

                if wfs and identifier in wfs.contents:
                    found = True;
                    dstitle = convert_encoding(wfs.contents[identifier].title    if wfs.contents[identifier].title    else identifier)
                    dsabstr = convert_encoding(wfs.contents[identifier].abstract if wfs.contents[identifier].abstract else "")

                    if wfs.contents[identifier].boundingBoxWGS84 is not None:
                        # For WFS 1.0, at least, the boundingBoxWGS84 is actually a local CRS bounding box
                        bb = wfs.contents[identifier].boundingBoxWGS84    # Looks like (91979.2, 436330.0, 92615.5, 437657.0)
                        bboxLeft, bboxBottom, bboxRight, bboxTop = bb
                    else:
                        # Make sure there are no Area of Interest tags for this dataset if the bb has disappeared
                        # This is actually not needed as datasets are checked for bb info when the tag list is generated

                        # Make sure this dataset is not used as the aoi for any configurations
                        sql = "UPDATE " + tables["modconfigs"] + " SET aoi = -1 WHERE aoi = " + str(adapt(dsid))
                        updateCursor.execute(sql)

                    # Check if dataset is available in the city's local srs
                    for c in wfs.contents[identifier].crsOptions:
                        if isEqualCrs(c.id, cityCRS[cityId]):
                            hasCityCRS = True
                            break
                    
                if wcs and identifier in wcs.contents:
                    found = True;
                    crs = None
                    dstitle = convert_encoding(wcs.contents[identifier].title    if wcs.contents[identifier].title    else identifier)
                    dsabstr = convert_encoding(wcs.contents[identifier].abstract if wcs.contents[identifier].abstract else "")


                    for c in wcs.contents[identifier].supportedCRS:     # crsOptions is available here, but always empty; only exists for OOP
                        if isEqualCrs(c.id, cityCRS[cityId]):
                            hasCityCRS = True
                            crs = c.id
                            break


                    dc = wcs.getDescribeCoverage(identifier)

                    # Check for error
                    errors = dc.xpath("//*[local-name() = 'ExceptionReport']")
                    if len(errors) > 0:
                        errorText = "No error message"
                        errorMsgs = dc.xpath("//*[local-name() = 'ExceptionText']")
                        if len(errorMsgs) > 0:
                            errorText = errorMsgs[0].text
                        print "Error with " + identifier + " on " + serverUrl + ": " + errorText
                        continue


                    # gridOffsets = dc.find(".//{*}GridOffsets") 
                    gridOffsets = dc.xpath("//*[local-name() = 'GridOffsets']")

                    if len(gridOffsets) == 0:
                        print "Can't find GridOffsets for WCS dataset " + serverUrl + " >>> " + identifier
                        continue
                    else:
                        resX, resY = gridOffsets[0].text.split()
                        if(float(resX) < 0):
                            resX = float(resX) * -1
                        if(float(resY) < 0):
                            resY = float(resY) * -1


                    # Try to get the native bounding box, if we can find it.  If we can't we'll try projecting the WGS84 bounding box, but this
                    # is less accurate
                    if(hasCityCRS):
                        # bb = dc.find(".//{*}BoundingBox[@crs='" + crs + "']")
                        lc = None
                        bbs = dc.xpath("//*[local-name() = 'LowerCorner']")
                        for bb in bbs:
                            if bb.getparent().get("crs") and isEqualCrs(bb.getparent().get("crs"), crs):
                                lc = bb.text
                                break

                        uc = None
                        bbs = dc.xpath("//*[local-name() = 'UpperCorner']")
                        for bb in bbs:
                            if bb.getparent().get("crs") and isEqualCrs(bb.getparent().get("crs"), crs):
                                uc = bb.text
                                break


                        if lc is not None and uc is not None:
                            bboxLeft, bboxBottom = string.split(lc)
                            bboxRight, bboxTop   = string.split(uc)


                    # Try projecting the WGS84 bounding box
                    if bboxTop == "":
                        bb = wcs.contents[identifier].boundingBoxWGS84
                        bboxLeft, bboxBottom, bboxRight, bboxTop = projectWgsToLocal(bb, cityCRS[cityId])


                    if(len(wcs.contents[identifier].supportedFormats[0]) == 0):
                        print "Cannot get a supported format for WCS dataset " + serverUrl + " >>> " + identifier
                        continue
                    else:
                        index = 0

                        # If any of our preferred formats are available, set index appropriately
                        if 'image/img' in wcs.contents[identifier].supportedFormats[index].lower():
                            index = wcs.contents[identifier].supportedFormats.index('image/img')    # This is our preferred format; use it if available
                        elif 'image/tiff' in wcs.contents[identifier].supportedFormats[index].lower():
                            index = wcs.contents[identifier].supportedFormats.index('image/tiff')   # Second choice is tiff
                            
                        imgFormat = wcs.contents[identifier].supportedFormats[index]


                if wms and identifier in wms.contents:
                    found = True;
                    dstitle = convert_encoding(wms.contents[identifier].title    if wms.contents[identifier].title    else identifier)
                    dsabstr = convert_encoding(wms.contents[identifier].abstract if wms.contents[identifier].abstract else "")

                if found:           # Update the database with the layer info
                    sqlList.append( "UPDATE " + tables["datasets"] + " "
                                    "SET title = "        + str(adapt(dstitle))    + ", "
                                        "abstract = "     + str(adapt(dsabstr))    + ", "
                                        "alive = TRUE, "
                                        "last_seen = NOW(), "
                                        "local_srs = "    + str(adapt(hasCityCRS)) + ", "
                                        "format = "       + str(adapt(imgFormat))  + ", "
                                        "bbox_left = "    + ("NULL" if bboxLeft   is None else str(adapt(bboxLeft)))   + ", "
                                        "bbox_right = "   + ("NULL" if bboxRight  is None else str(adapt(bboxRight)))  + ", "
                                        "bbox_top = "     + ("NULL" if bboxTop    is None else str(adapt(bboxTop)))    + ", "
                                        "bbox_bottom = "  + ("NULL" if bboxBottom is None else str(adapt(bboxBottom))) + ", "
                                        "resolution_x = " + str(adapt(resX))       + ", "
                                        "resolution_y = " + str(adapt(resY))       + " "
                                    "WHERE id = " + str(adapt(dsid)) 
                                  )
                else:
                     print "Not found: " + identifier + " (on server " +  serverUrl + ")"

                print "Done with row!"

        except Exception as e:
            print "-----"
            print "Error scanning server " + serverUrl
            print type(e)
            print e.args
            print e
            print "-----"

        else:
            # Run queries and commit dataset transactions
            doSql(dbConn, updateCursor, upsertList, sqlList)



# Get the database connection info
print "Starting Harvester of Sorrow ", datetime.datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')


from harvester_pwd import dbDatabase, dbName, dbUsername, dbPassword, dbSchema

tables = { }
tables["wpsServers"]    = dbSchema + ".wps_servers"
tables["processes"]     = dbSchema + ".wps_processes"
tables["processParams"] = dbSchema + ".process_params"
tables["datasets"]      = dbSchema + ".datasets"
tables["dataservers"]   = dbSchema + ".dataservers"
tables["cities"]        = dbSchema + ".cities"
tables["modconfigs"]    = dbSchema + ".mod_configs"

# Connect to the database
dbConn = psycopg2.connect(host = dbDatabase, database = dbName, user = dbUsername, password = dbPassword)

dbConn.set_client_encoding("UTF-8")

# Turn autocommit on to avoid locking our select statements
# set_session([isolation_level,] [readonly,] [deferrable,] [autocommit])
dbConn.set_session(autocommit=True)


serverCursor = dbConn.cursor()      # For listing servers
updateCursor = dbConn.cursor()      # For updating the database
dsCursor     = dbConn.cursor()      # For iterating over datasets and 

# Build a list of native CRS's for the cities
# Creates:
# {2: 'urn:ogc:def:crs:EPSG::31370', 3: 'urn:ogc:def:crs:EPSG::31467', 4: 'urn:ogc:def:crs:EPSG::2154', 5: 'urn:ogc:def:crs:EPSG::28992'}
cityCRS = {}
serverCursor.execute("SELECT id, srs FROM " + tables["cities"])

for row in serverCursor:
    cityCRS[row[0]] = row[1]


try:
    checkWPS(serverCursor)
    checkDataServers(serverCursor)

except Exception as e:
    print "-----"
    print "Unexpected error!"
    print type(e)
    print e.args
    print e
    print "-----"

    dbConn.rollback()

# Close all cursors/connections
try:
    serverCursor.close()
except:
    print "Error closing serverCursor"

try:
    dsCursor.close()
except:
    print "Error closing dsCursor"

try:
    updateCursor.close()
except:
    print "Error closing updateCursor"

try:
    dbConn.close()
except:
    print "Error closing dbConn!"

print "Done!"
