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

class BufferWFS(Example):

    def __init__(self):
    
        Example.__init__(self)
        
        self.outputs = {"buffered_vector":"BufferedRegions"}
        
        # Test with a WFS resource
        self.iniCli.init(
		    # Process Server address
		    "http://wps.iguess.tudor.lu/cgi-bin/pywps.cgi?", 
		    # Process name
		    "buffer", 
		    # Inputs
		    [("buffer_width","5"),
             ("vector","http://maps.iguess.tudor.lu/cgi-bin/mapserv?map=/srv/mapserv/MapFiles/RO_localOWS_test.map&SERVICE=WFS&CRS=EPSG:28992&BBOX=92213.1,436672.0,92347.8,436795.0&VERSION=1.0.0&REQUEST=getFeature&TYPENAME=RO_building_footprints_mini")],
		    # Output
		    self.outputs)
        
        
        