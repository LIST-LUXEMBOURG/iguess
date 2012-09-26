'''
Created on Aug 28, 2012

@author: Luis de Sousa [luis.desousa@tudor.lu]
'''

__all__ = ["DataSet","MapServerText"]

from ConfigParser import SafeConfigParser
import urllib2
import uuid
import os
import MapServerText as UMN
import DataSet as GDAL

DEBUG = True

###########################################################

class Tags:
    
    preRef  = "<wps:Reference"
    preId   = "<ows:Identifier>"
    sufId   = "</ows:Identifier>"
    preLit  = "<wps:LiteralData>"
    sufLit  = "</wps:LiteralData>"
    preCplx = "<wps:ComplexData"
    sufCplx = "</wps:ComplexData>"
    preAck  = "<wps:ProcessAccepted>"
    preFail = "<wps:ProcessFailed>"
    sufFail = "</wps:ProcessFailed>"
    preSucc = "<wps:ProcessSucceeded>"
    preOut  = "<wps:Output>"
    

###########################################################

class Output:
    
    name = None
    value = None
    
    def __init__(self, rawString):
        
        self.name = rawString.split(Tags.preId)[1].split(Tags.sufId)[0]
        
    
    def getReferenceValue(self, rawString):
        
        if not (Tags.preRef in rawString):
            if DEBUG: 
                print "Error: tried to download a non reference output."
            return;
        
        url = rawString.split("wps:Reference href=\"")[1].split("\"")[0]
        r = urllib2.urlopen(urllib2.Request(url))
        self.value = r.read()
        r.close()
        

###########################################################

class LiteralOutput(Output):

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

    uniqueID = None
    path = None
    extension = "gml"

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
        
        file = None
        self.path = os.path.join(dest, self.uniqueID + "_" + self.name + "." + self.extension)
        
        try:
            file = open(self.path, 'w')
            file.write(self.value)
            print "Saved output file: %s\n" %self.path
        except Exception, err:
            print "Error saving %s:\n%s" %(self.path, err)
        finally:
            if file <> None:
                file.close()
                
        
        
##########################################################

class WPSClient:
    """ """
    
    UUID = None
    map  = None
    epsg = None
    serverAddress = None
    processId = None
    inputNames = None
    inputValues = None
    request = None
    statusURL = None
    percentCompleted = 0
    resultsComplex = []
    resultsLiteral = []
    
    #Configs
    pathFilesGML = ""
    mapServerURL = ""
    mapFilesPath = ""
    mapTemplate  = ""
    imagePath    = ""
    imageURL     = ""
    otherProjs   = ""
    
    def __init__(self, serverAddress, processId, inputNames, inputValues):
        
        self.serverAddress = serverAddress
        self.processId = processId
        self.inputNames = inputNames
        self.inputValues = inputValues
        self.UUID = uuid.uuid1().__str__()
        
        self.loadConfigs()
        
    def loadConfigs(self):
        """ Loads default values from the configuration file. """
        
        parser = SafeConfigParser()
        parser.read('WPSClient.cfg')
    
        self.pathFilesGML = parser.get('Data',      'GMLfilesPath')
        self.mapServerURL = parser.get('MapServer', 'MapServerURL')
        self.mapFilesPath = parser.get('MapServer', 'mapFilesPath')
        self.mapTemplate  = parser.get('MapServer', 'mapTemplate')
        self.imagePath    = parser.get('MapServer', 'imagePath')
        self.imageURL     = parser.get('MapServer', 'imgeURL')
        self.otherProjs   = parser.get('MapServer', 'otherProjs')
        
    def buildRequest(self):
        
        if len(self.inputNames) <> len(self.inputValues):
            print "Different number of input names and values."
            return
        
        inputs = ""
        for i in range(0, len(self.inputNames)):
            inputs += self.inputNames[i] + "=" + self.inputValues[i]
            if (i < (len(self.inputNames) - 1)):
                inputs += ";"
                
        self.request  = self.serverAddress
        self.request += "&REQUEST=Execute&IDENTIFIER=" + self.processId
        self.request += "&SERVICE=WPS&VERSION=1.0.0&DATAINPUTS=" + inputs
        self.request += "&STOREEXECUTERESPONSE=true&STATUS=true"
        
    def sendRequest(self):
        """ 
        It is inspired on this page:
        http://stpreAckoverflow.com/questions/862173/how-to-download-a-file-using-python-in-a-smarter-way/863017#863017
        """       
        
        self.buildRequest()
        
        if(self.request == None):
            print "It wasn't possible to build a request with the given arguments"
            return

        if DEBUG:
            print "Starting download of %s" %self.request
    
        r = urllib2.urlopen(urllib2.Request(self.request))
        self.xmlResponse = r.read()
        r.close()
        
        if DEBUG:
            print "First response:\n"
            print self.xmlResponse
            
        #Check if the process was accepted
        if not (Tags.preAck in self.xmlResponse):
            print "Failed to start process at the remote server with following message:\n"
            print self.xmlResponse
            return
        
        self.statusURL = self.xmlResponse.split("statusLocation=\"")[1].split("\"")[0]

    def checkStatus(self):
        
        if (self.statusURL == None):
            print "To soon to ask for status"
            return False
        
        r = urllib2.urlopen(urllib2.Request(self.statusURL))
        self.xmlResponse = r.read()
        r.close()
        
        #Check if the process failed
        if (Tags.preFail in self.xmlResponse):
            print "The process failed with the following message:"
            print self.xmlResponse.split(Tags.preFail)[1].split(Tags.sufFail)[0]
            return True
           
        #Check if the process has finished
        if not (Tags.preSucc in self.xmlResponse):
            print "The process hasn't finished yet."
            if ("percentCompleted" in self.xmlResponse):
                self.percentCompleted = self.xmlResponse.split("percentCompleted=\"")[1].split("\"")[0]
                print str(self.percentCompleted) + " % of the execution complete."
            return False
        
        if DEBUG:
            print "The process has finished successfully. \n \
            Processing the results..."
        
        #Process the results
        outVector = self.xmlResponse.split(Tags.preOut)
        for o in outVector:
            if o.count(Tags.preLit) > 0:
                self.resultsLiteral.append(LiteralOutput(o))
            elif o.count(Tags.preCplx) > 0:
                self.resultsComplex.append(ComplexOutput(o, self.UUID))
            # Reference outputs
            elif o.count(Tags.preRef) > 0:
                # Assumes that Complex outputs have a mimeType
                if o.count("mimeType") > 0:
                    self.resultsComplex.append(ComplexOutput(o, self.UUID))
                else:
                    self.resultsLiteral.append(LiteralOutput(o))
                    
        # Save complex outputs to disk
        for c in self.resultsComplex:
            c.saveToDisk(self.pathFilesGML)
                    
        return True           
            
        
    def generateMapFile(self):
        """
        :returns: The path to the map file generated.
        """
        
        self.map = UMN.MapFile(self.UUID)
        
        self.map.shapePath    = self.pathFilesGML
        self.map.epsgCode     = self.epsg
        self.map.mapTemplate  = self.mapTemplate
        self.map.imagePath    = self.imagePath
        self.map.imageURL     = self.imageURL
        self.map.mapServerURL = self.mapServerURL
        self.map.mapFilesPath = self.mapFilesPath
        self.map.otherProjs   = self.otherProjs
        
        for c in self.resultsComplex:
            
            ds = GDAL.DataSet(c.path)
            
            if ds.dataType == "vector":
                style = UMN.MapStyle()
                layer = UMN.VectorLayer(c.path, ds.getBBox(), ds.getEPSG(), c.name)
                type = str(ds.getGeometryType())
                if type <> None:
                    layer.layerType = type
                else:
                    layer.layerType = "Polygon"
                print "The layer type: " + str(ds.getGeometryType())
                layer.addStyle(style)
                self.map.addLayer(layer)
              
            elif ds.dataType == "raster":
                layer = UMN.RasterLayer(c.path, ds.getBBox(), ds.getEPSG(), c.name)
                self.map.addLayer(layer)
                
            else:
                print "Warning: couldn't determine the type of Complex output " + c.name
                  
        
        self.map.writeToDisk()
        
        if DEBUG:
            print "Wrote map file to disk:\n" + self.map.filePath()
            
        return self.map.filePath()
        
    def getMapFilePath(self):
       
        if self.map <> None:
            return self.map.filePath()
        else:
            return None     
    
    