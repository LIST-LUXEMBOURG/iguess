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

Created on Nov 22, 2013

@author: desousa
'''

import logging
from Example import Example
import WPSClient

class Logging(Example):

    def __init__(self):
    
        Example.__init__(self)
        
        logging.basicConfig(filename="/tmp/test.log",
                            level="DEBUG",
                            format="[%(asctime)s] %(levelname)s: %(message)s")
        
        #self.iniCli = WPSClient.WPSClient(logging)
        
        self.outputNames = ["slope", "aspect"]
        self.outputTitles = ["slope_result", "aspect_result"]
        
        self.iniCli.init(
            # Process Server address
            "http://wps.iguess.tudor.lu/cgi-bin/pywps.cgi?", 
            # Process name
            "slope_aspect", 
            # Input names
            ["dem"], 
            # Input values - '&' character must be passed as '&amp;'
            ["http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/RO_localOWS_test.map&amp;SERVICE=WCS&amp;FORMAT=image/img&amp;CRS=EPSG:28992&amp;BBOX=92221,436692,92306,436769&amp;RESX=0.5&amp;RESY=0.5&amp;VERSION=1.0.0&amp;REQUEST=getCoverage&amp;COVERAGE=ro_dsm"],
            # Output names
            self.outputNames,
            #Output titles
            self.outputTitles)
        
        