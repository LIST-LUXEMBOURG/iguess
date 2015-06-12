#!/usr/bin/python
'''
using a template and jinja2

'''
import os
import sys
from owslib.csw import CatalogueServiceWeb
from jinja2 import Template

from iguess_db_credentials import base_pycsw_url

try:
    from lxml import etree
except ImportError:
    import xml.etree.ElementTree as etree
    
def send_transaction_request(**kwargs):
    pycsw_url = "http://meta.iguess.list.lu/"
    csw = CatalogueServiceWeb(pycsw_url)
    text = ""
    with open(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "iguess", "csw_template.xml")), "r") as r:
        text = r.read()
        
    template = Template(text)
    try:
        result = template.render(**kwargs)
    except:
        print "error rendering xml transaction template"
    
    #Questa chiamata e la relativa funzione sono assolutamente temporanee, da cancellare!!!!!
    try:
        verifico_ricezione_variabili(result)
    except:
        "problema durante la verifica"
    
    try:
        csw.transaction(ttype='insert', typename='gmd:MD_Metadata', record=result)
    except:
        "problem during transaction-insert"
    
    print csw.results

#Questa funzione mi serve in sviluppo, da cancellare!!!!
def verifico_ricezione_variabili(a):
        with open(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "iguess", "ricezione.txt")), "a") as r:
            r.write(a + "\n")

if __name__ == '__main__': 
    print "starting transactor"       
    if sys.argv:
        print "questo è stato chiamato da dataset_controller, non si tratta di un modulo..."
        scriptname, service, identifier, city_id, abstract, server_url, title = sys.argv
    # variables in sys.argv are those defined in dataset_controller/create
        send_transaction_request(id=id, abstract=abstract, title=title)