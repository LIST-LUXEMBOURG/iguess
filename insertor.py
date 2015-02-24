#!/usr/bin/python
'''
Just to try to launch the owslib csw transaction-insert
'''

from owslib.csw import CatalogueServiceWeb

url = "http://localhost/pycsw/csw.py"

csw = CatalogueServiceWeb(url)

#dr = csw.describeRecord()
csw.getdomain('GetRecords.resultType')

#csw.transaction(ttype='insert', typename='gmd:MD_Metadata', record=open("/home/matteo/matteo_transaction_example_frompycswtests.xml").read())
csw.transaction(ttype='update', typename='gmd:MD_Metadata', record=open("/home/matteo/inspire_editor_prova_3.xml").read())
print csw.results