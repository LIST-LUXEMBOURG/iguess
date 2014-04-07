#!/usr/bin/python

# Handles incoming delete requests from iGUESS

# Sample params:
# http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/AB_localOWS.map, AB_building_footprints
# http://maps.aberdeencity.gov.uk/ArcGIS/services/iGUESS_WMS/MapServer/WMSServer, 0
# http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/iGUESSMapFiles/pywps-02d056ba-5037-11e3-b573-005056a52e0d.map, pv_potential

import os
import sys
import mapscript
from checkbox.lib.text import split
from rdflib.sparql.bison.FunctionLibrary import STR

if len(sys.argv) != 3:
	raise Exception("Script requires 2 args: dataset_url and dataset_identifier")

scriptName, serverUrl, datasetIdentifier = sys.argv

# Get the path to the map file
filePath = split(serverUrl, "=")
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
    raise Exception("Sorry, I can not remove %s file." % layerData)

# Delete map file if no layers are left
if mapobject.numlayers <= 0: 
	if os.path.exists(filePath[1]):
	    os.remove(filePath[1])
	else:
	    raise Exception("Sorry, I can not remove %s file." % filePath[1])
