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

class SolarIrradiation(Example):

    def __init__(self):
    
        Example.__init__(self)
        
        self.outputNames = ['potential_pv_area','solar_irradiation']
        self.outputTitles = ['cb_roof','cb_solar']
        
        # Complete Solar Irradiation module
        self.iniCli.init(
            "http://wps.iguess.tudor.lu/cgi-bin/pywps.cgi?",
            "solar_irradiation", 
            ['dsm','roof_training_area','octa','building_footprints','ratio','region','linke','roof_training_area_col'],
            ['http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/RO_localOWS_test.map&amp;SERVICE=WCS&amp;FORMAT=image/img&amp;CRS=EPSG:28992&amp;BBOX=92221,436692,92306,436769&amp;RESX=0.5&amp;RESY=0.5&amp;VERSION=1.0.0&amp;REQUEST=getCoverage&amp;COVERAGE=ro_dsm',
             'http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/RO_localOWS_test.map&amp;SERVICE=WFS&amp;CRS=EPSG:28992&amp;VERSION=1.0.0&amp;REQUEST=getFeature&amp;TYPENAME=RO_training_areas_mini',
             'http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/RO_localOWS_test.map&amp;SERVICE=WFS&amp;VERSION=1.0.0&amp;REQUEST=getFeature&amp;TYPENAME=RO_octa',
             'http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/RO_localOWS_test.map&amp;SERVICE=WFS&amp;CRS=EPSG:28992&amp;VERSION=1.0.0&amp;REQUEST=getFeature&amp;TYPENAME=RO_building_footprints_mini',
             'http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/RO_localOWS_test.map&amp;SERVICE=WFS&amp;VERSION=1.0.0&amp;REQUEST=getFeature&amp;TYPENAME=RO_ratio',
             'http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/RO_localOWS_test.map&amp;SERVICE=WFS&amp;VERSION=1.0.0&amp;REQUEST=getFeature&amp;TYPENAME=RO_clip_mini',
             'http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/RO_localOWS_test.map&amp;SERVICE=WFS&amp;VERSION=1.0.0&amp;REQUEST=getFeature&amp;TYPENAME=RO_linke',
             'type'],
            self.outputNames, 
            self.outputTitles)

        