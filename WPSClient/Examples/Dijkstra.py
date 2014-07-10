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

Created on Jan 17, 2014

@author: desousa
'''

from Example import Example
import WPSClient

class Dijkstra(Example):

    def __init__(self):
    
        Example.__init__(self)
        
        self.outputs = {"path":"ShortestPath"}
        
        # Test with a WFS resource
        self.iniCli.init(
		    # Process Server address
		    "http://wps.iguess.tudor.lu/cgi-bin/pywps-lamilo.cgi?", 
		    # Process name
		    "dijkstra", 
		    # Inputs
		    [("network", "Lux"), ("start", "30"), ("target", "60")],
		    # Outputs
		    self.outputs)
        
        