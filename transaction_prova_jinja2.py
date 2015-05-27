#!/usr/bin/python
'''
using a template and jinja2

'''

import os
import sys
from owslib.csw import CatalogueServiceWeb
from jinja2 import Template


try:
    from lxml import etree
except ImportError:
    import xml.etree.ElementTree as etree

#pycsw_url = "http://iguess-meta.kirchberg.tudor.lu/pycsw/csw.py"
pycsw_url = "http://localhost/pycsw/csw.py"
scriptname, service, identifier, city_id, abstract, server_url, title = sys.argv


csw = CatalogueServiceWeb(pycsw_url)

#rootname = "{http://www.isotc211.org/2005/gmd}MD_Metadata"
#chstring = "CharacterString"


def verifico_ricezione_variabili(a):
        with open('/home/matteo/dev/tudor/iguess/ricezione.txt', 'a') as f:
            f.write(a + "\n")

datestamp = "19/05/2015"
#imported = {id:id, abstract:abstract, title:title, datestamp:datestamp}

def serialize_metadata(**kwargs):
    text = ""
    id = "meta-" + str(id)
    with open(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "iguess", "csw_insert_template_short.xml")), "r") as r:
        text = r.read()
        print r
    template = Template(text)
    result = template.render(**kwargs)
    return result

a = serialize_metadata(id=identifier, abstract=abstract, title=title, datestamp=datestamp)
verifico_ricezione_variabili(a)


csw.transaction(ttype='insert', typename='gmd:MD_Metadata', record=a)

print csw.results
'''

def create_iso(rootname, chstring, id):
        root = etree.Element(rootname)
        doc = etree.ElementTree(root)
        fileIdentifier = etree.SubElement(root, "fileIdentifier")        
        characterString = etree.SubElement(fileIdentifier, chstring)
        characterString.text = id
        output = etree.tostring(doc, pretty_print=True)
        
        verifico_ricezione_variabili(output)
        
create_iso(rootname, chstring, id)


tree = etree.parse("/home/matteo/inspire_editor_prova_3.xml")

stringa = etree.tostring(tree)

csw.transaction(ttype='insert', typename='gmd:MD_Metadata', record=stringa)

print csw.results
'''