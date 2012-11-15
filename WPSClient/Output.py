'''
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
    """
    
    name = None
    value = None
    
    def __init__(self, rawString):
        
        self.name = rawString.split(Tags.preId)[1].split(Tags.sufId)[0]
        
    
    def getReferenceValue(self, rawString):
        """
        Fetches the output value from the remote WPS server in case it has been
        return as a reference.
        
        :param rawString: the section of the WPS process XML response corresponding
        to this output
        """
        
        if not (Tags.preRef in rawString):
            logging.error("Output not created, tried to download a non reference output")
            return;
        
        url = rawString.split("wps:Reference href=\"")[1].split("\"")[0]
        r = urllib2.urlopen(urllib2.Request(urllib2.unquote(url)))
        self.value = r.read()
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
       
        
