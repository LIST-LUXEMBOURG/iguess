#!/usr/bin/python

import sys
from owslib.csw import CatalogueServiceWeb
from transaction_insert_xml_serializer import Transactor
from lxml import etree
import os.path

pycsw_url = "http://iguess-meta.kirchberg.tudor.lu/pycsw/csw.py"
scriptname, service, identifier, city_id, abstract, server_url, title = sys.argv

if len(sys.argv) != 7:
    raise Exception("Script requires 6 args: dataset_url and dataset_identifier")

def verifico_ricezione_variabili(args):
    with open('/home/matteo/dev/tudor/iguess/ricezione.txt', 'a') as f:
        #f.write([str(var)+ "\n" for var in args])
        f.write(str(service) + " " + str(identifier)+ " " + str(city_id)+ " " + str(abstract)+ " " + str(server_url)+ " " + str(title)+ " ""\n")
        
verifico_ricezione_variabili(sys.argv)



csw = CatalogueServiceWeb(pycsw_url)

#dr = csw.describeRecord()
#csw.getdomain('GetRecords.resultType')

def create_metadata_iso_xml(datalist, rootname):
     root = etree.Element(rootname)


#csw.transaction(ttype='insert', typename='gmd:MD_Metadata', record=open("/home/matteo/matteo_transaction_example_frompycswtests.xml").read())
csw.transaction(ttype='insert', typename='gmd:MD_Metadata', record=open("/home/matteo/inspire_editor_prova_3.xml").read())
print csw.results

# esempio di lxml tratto da http://gis.stackexchange.com/questions/60705/writing-iso19139-compliant-xml-metadata-from-a-spreadsheet

def list_to_xml(datalist,rootname):
    '''Transform a metadata record to a flat XML string'''

    root = etree.Element(rootname)

    for fld in datalist:
        col=fld[0]
        dat=str(fld[1]) # may need to be careful of unicode encoding issues
                        # when reading data from Excel

        child=etree.SubElement(root,col)
        child.text=dat

    return root

def transform(inxml,xslfile):
    xslfile=os.path.abspath(xslfile).replace('\\','/') #xslt doesn't like backslashes in absolute paths...
    xsl = etree.parse(xslfile)
    xslt = etree.XSLT(xsl)
    return xslt(inxml)

xslfile = 'test.xslt'

#Column headers from the Excel spreadsheet
header=['column1','xmin','ymin','xmax','ymax','thelastcolumn']

#Data pulled out of the spreadsheet
#You would loop over all rows and do a transform on each row
row=['A value',1.2345,5.4321,2.3456,6.5432,'last value']

inxml = list_to_xml(zip(header,row),"ExcelMetadata")
print etree.tostring(inxml)

#The above prints - <ExcelMetadata><column1>A value</column1><xmin>1.2345</xmin><ymin>5.4321</ymin><xmax>2.3456</xmax><ymax>6.5432</ymax><thelastcolumn>last value</thelastcolumn></ExcelMetadata>

iso19139 = transform(inxml,xslfile)
print str(iso19139)
