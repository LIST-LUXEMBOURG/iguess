#!/usr/bin/python
'''
In this prototype module I'm exploring one way of serializing Information,
using the lxml library. The module is launched by the "create" action of the
datasets controller, from iguess, when a new dataset is registered, and is supposed to create
a new Catalogue (CSW) record sending a transaction:insert POST request to the pycsw server.
The module is receiving variables with data content from rails, and serializes them in a ISO19139
standard compliant XML request. The create_iso function is building the XML. Still having to deal with some namespace management,
but it is working correctly. The XML result is printed on a file for testing purposes. Some validation against the
ISO19139 schema would be helpful. 

'''


import sys
from owslib.csw import CatalogueServiceWeb


try:
    from lxml import etree
except ImportError:
    import xml.etree.ElementTree as etree

#pycsw_url = "http://iguess-meta.kirchberg.tudor.lu/pycsw/csw.py"
pycsw_url = "http://localhost/pycsw/csw.py"
scriptname, service, identifier, city_id, abstract, server_url, title = sys.argv


csw = CatalogueServiceWeb(pycsw_url)

rootname = "{http://www.isotc211.org/2005/gmd}MD_Metadata"
chstring = "CharacterString"
id = "meta-" + str(identifier)

def verifico_ricezione_variabili(a):
        with open('/home/matteo/dev/tudor/iguess/ricezione.txt', 'a') as f:
            f.write(a + "\n")

def create_iso(rootname, chstring, id):
        root = etree.Element(rootname)
        doc = etree.ElementTree(root)
        fileIdentifier = etree.SubElement(root, "fileIdentifier")        
        characterString = etree.SubElement(fileIdentifier, chstring)
        characterString.text = id
        output = etree.tostring(doc, pretty_print=True)
        
        verifico_ricezione_variabili(output)
        
create_iso(rootname, chstring, id)
'''
tree = etree.parse("/home/matteo/inspire_editor_prova_3.xml")

stringa = etree.tostring(tree)

csw.transaction(ttype='insert', typename='gmd:MD_Metadata', record=stringa)

print csw.results
'''