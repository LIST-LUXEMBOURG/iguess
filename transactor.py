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
    
def send_transaction_request(**kwargs):
    pycsw_url = "http://localhost/pycsw/csw.py"
    csw = CatalogueServiceWeb(pycsw_url)
    text = ""
    with open(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "iguess", "csw_insert_template_short.xml")), "r") as r:
        text = r.read()
        
    template = Template(text)
    try:
        result = template.render(**kwargs)
        print "template renderizzato"
    except:
        print "error rendering xml transaction template"
    
    try:
        verifico_ricezione_variabili(result)
        print "verifica eseguita"
    except:
        "problema durante la verifica"
    
    try:
        csw.transaction(ttype='insert', typename='gmd:MD_Metadata', record=result)
        print "transazione eseguita"
    except:
        "problem during transaction-insert"
    
    print csw.results

    
def serialize_metadata(**kwargs):
    text = ""
    id = "meta-" + str(id)
    with open(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "iguess", "csw_insert_template_short.xml")), "r") as r:
        text = r.read()
        print r
    template = Template(text)
    result = template.render(**kwargs)
    verifico_ricezione_variabili(result)
    return result

def verifico_ricezione_variabili(a):
        with open(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "iguess", "ricezione.txt")), "a") as r:
            r.write(a + "\n")