#!/usr/bin/python
'''
using a template and jinja2

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


datestamp = "19/05/2015"
#imported = {id:id, abstract:abstract, title:title, datestamp:datestamp}

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

