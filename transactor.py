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
    
def serialize_metadata(**kwargs):
    text = ""
    id = "meta-" + str(id)
    with open(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "iguess", "csw_insert_template_short.xml")), "r") as r:
        text = r.read()
        print r
    template = Template(text)
    result = template.render(**kwargs)
    return result

def verifico_ricezione_variabili(a):
        with open('/home/matteo/dev/tudor/iguess/ricezione.txt', 'a') as f:
            f.write(a + "\n")