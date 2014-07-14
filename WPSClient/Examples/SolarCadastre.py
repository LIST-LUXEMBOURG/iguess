# coding: utf-8
'''
Copyright 2010 - 2014 CRP Henri Tudor

Licenced under the EUPL, Version 1.1 or – as soon they will be approved by the
European Commission - subsequent versions of the EUPL (the "Licence");
You may not use this work except in compliance with the Licence.
You may obtain a copy of the Licence at:

http://ec.europa.eu/idabc/eupl

Unless required by applicable law or agreed to in writing, software distributed
under the Licence is distributed on an "AS IS" basis, WITHOUT WARRANTIES OR
CONDITIONS OF ANY KIND, either express or implied. See the Licence for the
specific language governing permissions and limitations under the Licence.

Created on Nov 21, 2013

@author: desousa
'''

from Example import Example
import WPSClient

class SolarCadastre(Example):

    def __init__(self):
    
        Example.__init__(self)
        
        self.outputNames = ["solar_irradiation"]
        self.outputTitles = ["MySolarIrradiationMap"]
        
        ## Test with solar cadastre single process
        self.iniCli.init(
            # Process Server address
            "http://wps.iguess.tudor.lu/cgi-bin/pywps.cgi?", 
            # Process name
            "solar_cadastre", 
            # Input names
            ["dsm", "roof_training_area", "roof_training_area_col", "building_footprints", "month"], 
            # Input values - '&' character must be passed as '&amp;'
            ["http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/RO_localOWS_test.map&amp;SERVICE=WCS&amp;VERSION=1.0.0&amp;REQUEST=GetCoverage&amp;IDENTIFIER=ro_dsm_mini&amp;FORMAT=image/tiff&amp;BBOX=92217,436688,92313,436772&amp;CRS=EPSG:28992&amp;RESX=1&amp;RESY=1",
             "http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/RO_localOWS_test.map&amp;SERVICE=WFS&amp;VERSION=1.1.0&amp;REQUEST=getfeature&amp;TYPENAME=RO_training_areas_mini&amp;srsName=EPSG:28992",
             "type",
             "http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/RO_localOWS_test.map&amp;SERVICE=WFS&amp;VERSION=1.1.0&amp;REQUEST=getfeature&amp;TYPENAME=RO_building_footprints_mini&amp;srsName=EPSG:28992",
             "7"
             ],
            # Output names
            self.outputNames,
            #Output titles
            self.outputTitles)

        