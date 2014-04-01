#!/usr/bin/python

# Handles incoming delete requests from iGUESS

import sys

if len(sys.argv) != 3:
	raise Exception("Script requires 2 args: dataset_url and dataset_identifier")

scriptName, serverUrl, datasetIdentifier = sys.argv


# Sample params:
# http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/AB_localOWS.map, AB_building_footprints
# http://maps.aberdeencity.gov.uk/ArcGIS/services/iGUESS_WMS/MapServer/WMSServer, 0
# http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/iGUESSMapFiles/pywps-02d056ba-5037-11e3-b573-005056a52e0d.map, pv_potential


 # Determine if we should do anything, and then do it
