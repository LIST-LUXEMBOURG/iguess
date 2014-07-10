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

class PVPotential(Example):

	def __init__(self):
	
		Example.__init__(self)
        
		self.outputNames = ["pv_potential"]
		self.outputTitles = ["pv_potential"]
		
		# Test with solar PV potential
		self.iniCli.init(
			# Process Server address
			"http://wps.iguess.tudor.lu/cgi-bin/pywps.cgi?",
			# Process name
			"solar_potential",
			# Input names
			["solar_irradiation", "potential_pv_area", "building_footprints", "econ_lifetime", "payback_price"],
			# Input values - '&' character must be passed as '&amp;'
			["http://wps.iguess.tudor.lu/pywps/sampleData/ro_solar_irradiation.tif",
			"http://wps.iguess.tudor.lu/pywps/sampleData/ro_potential_pv_area.gml",
			"http://wps.iguess.tudor.lu/pywps/sampleData/ro_ground_old.gml",
			"20",
			"0.249"
			],
			# Output names
			self.outputNames,
		    #Output titles
		    self.outputTitles)
		