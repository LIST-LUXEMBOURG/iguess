#!/usr/bin/python
'''
Copyright (C) 2015 Luxembourg Institute of Science and Technology
  
This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
any later version.
  
This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.
  
You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
   
   
@author Matteo De Stefano [matteo.destefano@list.lu]
 
Abstract
======== 

Script to insert a catalogue record whenever a new dataset is registered.
The variables added to the pycsw repository are received from the create action
of dataset_controller. The XML template is populated using the jinja2 Template Class. 
owslib used to manage the transaction with pycsw.

'''

import os
import sys
import datetime
from owslib.csw import CatalogueServiceWeb
from jinja2 import Template


try:
    from lxml import etree
except ImportError:
    import xml.etree.ElementTree as etree


pycsw_url = "http://meta.iguess.list.lu/"
scriptname, service, identifier, city_id, abstract, server_url, title = sys.argv

id = "meta-" + str(identifier)
csw = CatalogueServiceWeb(pycsw_url)


def serialize_metadata(**kwargs):
    text = ""    
    with open(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "iguess", "csw_template.xml")), "r") as r:
        text = r.read()
        print r
    template = Template(text)
    result = template.render(**kwargs)
    return result

now = datetime.datetime.now()
organisation = "List"
language="eng"

a = serialize_metadata(id=id, abstract=abstract, title=title, datestamp=now, organisation=organisation, language=language)


csw.transaction(ttype='insert', typename='gmd:MD_Metadata', record=a)

print csw.results

