#!/usr/bin/python

# Handles incoming delete requests from iGUESS

# Sample params:
# http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/AB_localOWS.map, AB_building_footprints
# http://maps.aberdeencity.gov.uk/ArcGIS/services/iGUESS_WMS/MapServer/WMSServer, 0
# http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/iGUESSMapFiles/pywps-02d056ba-5037-11e3-b573-005056a52e0d.map, pv_potential

import os
import sys
import mapscript
from owslib.csw import CatalogueServiceWeb
#from checkbox.lib.text import split
pycsw_url = "http://meta.iguess.list.lu/"


if len(sys.argv) != 4:
	raise Exception("Script requires 3 args: dataset_url, dataset_identifier and dataset_id")

scriptName, serverUrl, datasetIdentifier, datasetId = sys.argv

# TODO: Should probably check the database to see if the server/identifier combo is still
# registered elsewhere

# Get the path to the map file
filePath = serverUrl.split("=")
print "This is the file path: " + str(filePath)
if len(filePath) < 2:
	raise Exception("Incorrect map file path.")

# Remove the layer from the map file
mapobject = mapscript.mapObj(filePath[1])
layer =	mapobject.getLayerByName(datasetIdentifier)
layerData = layer.data
mapobject.removeLayer(layer.index)
mapobject.save(filePath[1])

# Delete data file if it exists
if os.path.exists(layerData):
    os.remove(layerData)
else:
    raise Exception("Sorry, I cannot remove %s file." % layerData)

# Delete map file if no layers are left
if mapobject.numlayers <= 0: 
	if os.path.exists(filePath[1]):
	    os.remove(filePath[1])
	else:
	    raise Exception("Sorry, I cannot remove %s file." % filePath[1])

try:
	id = "meta-" + str(datasetId)
	csw = CatalogueServiceWeb(pycsw_url)
	csw.transaction(ttype='delete', typename='gmd:MD_Metadata', identifier=id)
except:
	print "Warning: transaction error while deleting the catalogue record"
	continue