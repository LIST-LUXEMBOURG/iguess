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

Created on Sep 26, 2012

@author: Luis de Sousa [luis.desousa@tudor.lu]

Module containing the Output classes. These classes provided methods to fetch
and store locally the results of a remote WPS process.
'''

import os
import urllib2
import logging
from Tags import Tags
import DataSet as GDAL

###########################################################

class Output:
    """
    Abstract class with generic elements of a WPS output.
    
    :param rawString: the section of the WPS process XML response corresponding
    to this output
    
    .. attribute:: name
        Name of the output
    
    .. value:: mapServerURL
        Value of the output
        
    .. attribute:: url
        URL of the output, if passed by reference
    """
    
    name = None
    value = None
    url = None
    
    def __init__(self, rawString):
        
        self.name = rawString.split(Tags.preId)[1].split(Tags.sufId)[0]
        
    
    def getReferenceValue(self, rawString):
        """
        Fetches the output value from the remote WPS server in case it has been
        return as a reference.
        
        :param rawString: the section of the WPS process XML response corresponding
        to this output
        """
        
        r = None
        
        if not (Tags.preRef in rawString):
            logging.error("Output not created, tried to download a non reference output")
            return;
        
        self.url = rawString.split(Tags.midRef)[1].split("\"")[0]
        
        try:
            r = urllib2.urlopen(urllib2.Request(urllib2.unquote(self.url)))
            self.value = r.read()
        except Exception, err:
            logging.error("Error retrieving %s:\n%s" %(self.url, err))
            return
        finally:
            if (r <> None):
                r.close()

###########################################################

class LiteralOutput(Output):
    """
    Literal output of WPS process.
    
    :param rawString: the section of the WPS process XML response corresponding
    to this output
    """

    def __init__(self, rawString):

        Output.__init__(self, rawString)
        
        # If the data is included in the string itself
        if Tags.preLit in rawString:
            self.value = rawString.split(Tags.preLit)[1].split(">")[1].split(Tags.sufLit)[0].split("</wps:LiteralData")[0] 

        # Otherwise it is a reference
        else:
            self.getReferenceValue(rawString)

###########################################################

class ComplexOutput(Output):
    """
    Complex output of WPS process.
    
    :param rawString: the section of the WPS process XML response corresponding
    to this output
    
    :param unique: unique identifier of the process that generated the output
            
    .. attribute:: uniqueID
        Unique identifier used in the name of the file storing the output
    
    .. value:: path
        Path where the output file is saved

    .. value:: extension
        Extension of the output file
        
    .. value:: dataSet
        GDAL wrapper object for the physical data set file

    """

    uniqueID = None
    path = None
    extension = "gml"
    dataSet = None

    def __init__(self, rawString, unique):

        Output.__init__(self, rawString)
        self.uniqueID = unique
        
        # If the data is included in the string itself
        if Tags.preCplx in rawString:
            
            self.value = rawString.split(Tags.preCplx)[1].split(Tags.sufCplx)[0]
            while self.value[0] <> "<":
                self.value = self.value[1:len(self.value)]
        
        # Otherwise it is a reference
        else:
            
            self.extension = rawString.split("mimeType=\"")[1].split("/")[1].split("\"")[0]
            self.getReferenceValue(rawString)
            

    def saveToDisk(self, dest):
        """
        Saves the output value to disk.
        
        :param dest: string with path where to save the output value
        """
        
        file = None
        
        if (self.url != None):
            s = self.url.split("/")
            self.path = os.path.join(dest, s[len(s) - 1])
        else:
            self.path = os.path.join(dest, self.uniqueID + "_" + self.name + "." + self.extension)
        
        try:
            file = open(self.path, 'w')
            file.write(self.value)
            file.close()
            logging.info("Saved output file: %s\n" %self.path)
            self.dataSet = GDAL.DataSet(self.path)
        except Exception, err:
            logging.error("Error saving %s:\n%s" %(self.path, err))
            return
        finally:
            if file <> None:
                file.close()
       
        
