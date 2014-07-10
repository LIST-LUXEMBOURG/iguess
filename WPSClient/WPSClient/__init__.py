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

Created on Aug 28, 2012

@author: Luis de Sousa [luis.desousa@tudor.lu]

This package provides tools to manage requests to a remote process server using
the Web Processing Service standard [1]. The outputs of these requests are 
fetched and published to a local map service, assuming they are of a spatial 
character when complex. The map service used is MapServer [2].
Parts of this code are inspired on the PyWPS [3] project, whose developers had
a relevant role in some of the solutions here coded.  
This package is released under the GPL-3.0 open source license [4].

[1] http://www.opengeospatial.org/standards/wps
[2] http://www.mapserver.org
[3] http://wiki.rsg.pml.ac.uk/pywps/Main_Page
[4] http://opensource.org/licenses/GPL-3.0
'''

__all__ = ["DataSet","MapServerText"]

import logging
from ConfigParser import SafeConfigParser
from owslib.wps import WebProcessingService, WPSExecution
from DataSet import DataSet
#import MapServerText as UMN
from MapFileText.Text import MapFile, RasterLayer, VectorLayer, MapStyle

##########################################################

class WPSClient:
    """ 
    This class manages the WPS request, status checking and results 
    processing cycle. 
    
    .. attribute:: logger
        Reference to logging object
        
    .. attribute:: logFormat
        String formating log output
        
    .. attribute:: processName
        Name of the process to invoke
    
    .. attribute:: inputs
        Array of pair lists composed by the input name and the respective value
    
    .. attribute:: outputs
        Array of pair lists composed by the output name and a boolean indicating return
        by reference (True) or data (False)
         
    .. attribute:: wps
        WPSExecution object used to communicate with the WPS server
               
    .. attribute:: execution
        WebProcessingService object used to invoke process execution on the remote WPS server
            
    .. attribute:: statusURL
        URL of the remote XML file where the process updates its status and 
        writes its results after completion
    
    .. attribute:: processId
        Identifier of the remote process, part of statusURL used to identify
        the results stored locally
    
    .. attribute:: percentCompleted
        Percentage of process completion, as reported in the status XML file
        
    .. attribute:: statusMessage
        Last status message returned during asynchronous execution
    
    .. attribute:: map
        Object of type MapFile used to generate the map file publishing complex
        outputs through MapServer
    
    .. attribute:: epsg
        EPSG code of the primary coordinate system used to publish complex 
        outputs
     
    .. attribute:: dataSets
        Array with output dataSets, created during map file generation
               
    .. attribute:: logFile
        Path to the log file
        
    .. attribute:: logLevel
        Level of logging
    
    .. attribute:: pathFilesGML
        Path where to store the GML files with complex outputs
    
    .. attribute:: mapServerURL
        URL of the MapServer instance to use
    
    .. attribute:: mapFilesPath
        Path where to write the map file (folder used by MapServer)
    
    .. attribute:: mapTemplate
        Path to the MapServer map template folder
    
    .. attribute:: imagePath
        Path to the MapServer image folder
    
    .. attribute:: imageURL
        URL to MapServer images folder
    
    .. attribute:: otherProjs
        String listing EPSG codes of further coordinate systems with which to
        publish the complex outputs
    """
    
    logger = None
    logFormat = "[WPSClient][%(asctime)s] %(levelname)s: %(message)s"
    
    processName = None
    inputs = None
    outputs = None
    wps = None
    execution = None
    statusURL = None
    processId = None
    percentCompleted = 0
    statusMessage = None
    map  = None
    epsg = None
    dataSets = []
    
    #Configs
    logFile      = None
    logLevel     = None
    pathFilesGML = None
    mapServerURL = None
    mapFilesPath = None
    mapTemplate  = None
    imagePath    = None
    imageURL     = None
    otherProjs   = None
    
    meta_fees = "none"
    meta_accessconstraints = "none"
    meta_keywordlist = ""
    meta_addresstype = ""
    meta_address = ""
    meta_city = ""
    meta_stateorprovince = ""
    meta_postcode = ""
    meta_country = ""
    meta_contactelectronicmailaddress = ""
    meta_contactperson = ""
    meta_contactorganization = ""
    meta_contactposition = ""
    meta_role = ""
    meta_contactvoicetelephone = ""
    meta_contactfacsimiletelephone = ""
    meta_contactinstructions = ""
    meta_hoursofservice = ""

    RUNNING = 1
    FINISHED = 2
    ERROR = 3
    
    #Messages
    WARN_02 = "Output "
    WARN_03 = " not added to the map file, possibly non complex output."
    WARN_04 = "No spatial layers found, no map file was written."
    ERR_04  = "EXECUTE request failed:\n"
    ERR_05  = "Incomplete request -- missing URL"
    ERR_06  = "The process failed with the following message:\n"
    ERR_07  = "Failed to save map file to disk:\n"
    SUCC_01 = "The process has finished successfully.\nProcessing the results..."
    SUCC_02 = "Wrote map file to disk:\n"
    
    def __init__(self, logger = None):
         
        self.loadConfigs()
        
        if (logger == None):
            self.setupLogging()
            
        
    def init(self, serverAddress, processName, inputs, outputs):
        """
        Initialises the WPSClient object with the required arguments to create
        the WPS request.
        
        :param serverAddress: string with the address of the remote WPS server
        :param processName: string with process name
        :param inputNames: list of strings with input names
        :param inputValues: list of strings with input values
        :param outputNames: list of strings with output names       
        """
        
        # Loading this stuff here probably doesn't make sense
        # Check at a later data if __init__ is run from an external model (that includes this one)
        self.loadConfigs()
        self.setupLogging()
        
        self.processName = processName
        self.inputs = inputs
        self.outputs = outputs
        
        self.wps = WebProcessingService(serverAddress, verbose=False, skip_caps=True)       
        
        
    def initFromURL(self, url, outputs):
        """
        Initialises the WPSClient with the status URL address of a running 
        remote process. Used when a request has already been sent.
        
        :param url: string with the status URL address of a remote process      
        """
        
        # Loading this stuff here probably doesn't make sense
        # Check at a later data if __init__ is run from an external model (tha includes this one)
        self.loadConfigs()
        self.setupLogging()
        
        # Note that the outputs are not used
        self.statusURL = url
        self.outputs = outputs
        self.processId = self.decodeId(url)
        
    def loadConfigs(self):
        """ 
        Loads default attribute values from the configuration file. 
        """
        
        parser = SafeConfigParser()
        parser.read('WPSClient.cfg')
    
        self.logFile      = parser.get('Logging',   'logFile')
        self.logLevel     = parser.get('Logging',   'logLevel')
        self.pathFilesGML = parser.get('Data',      'GMLfilesPath')
        self.mapServerURL = parser.get('MapServer', 'MapServerURL')
        self.mapFilesPath = parser.get('MapServer', 'mapFilesPath')
        self.mapTemplate  = parser.get('MapServer', 'mapTemplate')
        self.imagePath    = parser.get('MapServer', 'imagePath')
        self.imageURL     = parser.get('MapServer', 'imageURL')
        self.otherProjs   = parser.get('MapServer', 'otherProjs')
        
        if parser.has_option('MapServer', 'meta_fees'):
            self.meta_fees = parser.get('MapServer', 'meta_fees')
        if parser.has_option('MapServer', 'meta_accessconstraints'):
            self.meta_accessconstraints = parser.get('MapServer', 'meta_accessconstraints')
        if parser.has_option('MapServer', 'meta_keywordlist'):
            self.meta_keywordlist = parser.get('MapServer', 'meta_keywordlist')
        if parser.has_option('MapServer', 'meta_addresstype'):
            self.meta_addresstype = parser.get('MapServer', 'meta_addresstype')
        if parser.has_option('MapServer', 'meta_address'):
            self.meta_address = parser.get('MapServer', 'meta_address')
        if parser.has_option('MapServer', 'meta_city'):
            self.meta_city = parser.get('MapServer', 'meta_city')
        if parser.has_option('MapServer', 'meta_stateorprovince'):
            self.meta_stateorprovince = parser.get('MapServer', 'meta_stateorprovince')
        if parser.has_option('MapServer', 'meta_postcode'):
            self.meta_postcode = parser.get('MapServer', 'meta_postcode')
        if parser.has_option('MapServer', 'meta_country'):
            self.meta_country = parser.get('MapServer', 'meta_country')
        if parser.has_option('MapServer', 'meta_contactelectronicmailaddress'):
            self.meta_contactelectronicmailaddress = parser.get('MapServer', 'meta_contactelectronicmailaddress')
        if parser.has_option('MapServer', 'meta_contactperson'):
            self.meta_contactperson = parser.get('MapServer', 'meta_contactperson')
        if parser.has_option('MapServer', 'meta_contactorganization'):
            self.meta_contactorganization   = parser.get('MapServer', 'meta_contactorganization')
        if parser.has_option('MapServer', 'meta_contactposition'):
            self.meta_contactposition = parser.get('MapServer', 'meta_contactposition')
        if parser.has_option('MapServer', 'meta_role'):
            self.meta_role = parser.get('MapServer', 'meta_role')
        if parser.has_option('MapServer', 'meta_contactvoicetelephone'):
            self.meta_contactvoicetelephone = parser.get('MapServer', 'meta_contactvoicetelephone')
        if parser.has_option('MapServer', 'meta_contactfacsimiletelephone'):
            self.meta_contactfacsimiletelephone = parser.get('MapServer', 'meta_contactfacsimiletelephone')
        if parser.has_option('MapServer', 'meta_contactinstructions'):
            self.meta_contactinstructions = parser.get('MapServer', 'meta_contactinstructions')
        if parser.has_option('MapServer', 'meta_hoursofservice'):
            self.meta_hoursofservice = parser.get('MapServer', 'meta_hoursofservice')

        
    def setupLogging(self):
        """
        Sets up the logging file.
        """
        
        formatter = logging.Formatter(self.logFormat)
        
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(self.logLevel)

        if(self.logFile == None):
            ch_stream = logging.StreamHandler()
            #ch_stream.setLevel(logging.INFO)
            ch_stream.setFormatter(formatter)
            self.logger.addHandler(ch_stream)
            
        else:
            ch_file = logging.FileHandler(self.logFile, 'a')
            #ch_file.setLevel(self.logLevel)
            ch_file.setFormatter(formatter)
            self.logger.addHandler(ch_file)            
        
    def decodeId(self, url):
        """
        Decodes the remote process identifier from the status URL.
        
        :param: string with the status URL address of a remote process
        :returns: string with the process identifier  
        """
        
        s = url.split("/")
        return s[len(s) - 1].split(".")[0] 
    
    def getPercentCompleted(self):
        """
        :returns: process execution progress in percentage   
        """
        if (self.execution is not None): 
            return self.execution.percentCompleted
        else:
            return None
        
    def getStatusMessage(self):
        """
        :returns: last status message returned by the server   
        """
        if (self.execution is not None):
            return self.execution.statusMessage
        else:
            return None
        
    def getProcessErrorCode(self):
        """
        :returns: last error code returned by the server   
        """
        if (self.processError is not None):
            return self.processError.code
        else:
            return None
        
    def getProcessErrorText(self):
        """
        :returns: last error message returned by the server   
        """
        if (self.processError is not None):
            return self.processError.text
        else:
            return None
            
    def sendRequest(self):
        """
        Uses the wps object to start the process execution. Stores the
        status URL and the process in the statusURL and processId attributes.
        
        :returns: string with the status URL, None in case of error
        """
        
        execOutputs = []
        for key in self.outputs:
            execOutputs.append((key, "True"))
        
        self.execution = self.wps.execute(self.processName, self.inputs, execOutputs)
        
        self.logger.info("The request sent: \n" + self.execution.request)
        self.logger.debug("The status URL: " + self.execution.statusLocation)
        
        if len(self.execution.errors) > 0:
            self.logger.error(self.ERR_04 + self.execution.errors[0].code + self.execution.errors[0].text)
            raise Exception(self.ERR_04 + self.execution.errors[0].code + self.execution.errors[0].text)
            return None
        
        self.statusURL = self.execution.statusLocation
        self.processId = self.decodeId(self.statusURL)
        
        return self.statusURL  

    def checkStatus(self):
        """
        Sends a request to the status URL checking the progress of the remote 
        process. If the process has finished creates the necessary Output 
        objects to fetch the results and stores them in the resultsLiteral and
        resultsComplex attributes.
        
        :returns: True if the process finished successfully 
                  False if the process is still running
        :rtype: Boolean
        """
        
        self.processError = ""
        self.processErrorCode = ""
        self.processErrorText = ""
        self.status = None                     

        if (self.statusURL == None):
            self.logger.error(self.ERR_05)
            raise Exception(self.ERR_05)

        self.execution = WPSExecution()
        self.execution.statusLocation = self.statusURL
        self.execution.checkStatus(sleepSecs=0)
        
        # Check if the process has finished
        if not (self.execution.isComplete()):
            self.status = self.RUNNING
            self.logger.debug("The process hasn't finished yet.")
            self.logger.info(str(self.percentCompleted) + " % of the execution complete.")
            return False
        
        # Check if the process failed
        if not (self.execution.isSucceded()):
            self.status = self.ERROR
            self.processError = self.execution.errors[0]
            self.processErrorText = self.execution.errors[0].text
            self.logger.error(self.ERR_06 + self.processErrorText)
            self.logger.debug("The status URL: " + self.execution.statusLocation)
            raise Exception(self.ERR_06 + self.processErrorText)


        self.logger.debug(self.SUCC_01)
        self.status = self.FINISHED
                    
        return True           
            
        
    def generateMapFile(self):
        """
        Creates the MapFile object that encodes a map file publishing the 
        complex outputs and writes it to disk.
        
        :returns: string with the path to the map file generated.
        """
        
        #self.map = UMN.MapFile(self.processId)
        self.map = MapFile(self.processId)
        
        self.map.shapePath    = self.pathFilesGML
        self.map.epsgCode     = self.epsg
        self.map.mapTemplate  = self.mapTemplate
        self.map.imagePath    = self.imagePath
        self.map.imageURL     = self.imageURL
        self.map.mapServerURL = self.mapServerURL
        self.map.mapFilesPath = self.mapFilesPath
        self.map.otherProjs   = self.otherProjs
        
        self.map.meta_fees = self.meta_fees
        self.map.meta_accessconstraints = self.meta_accessconstraints
        self.map.meta_keywordlist = self.meta_keywordlist
        self.map.meta_addresstype = self.meta_addresstype
        self.map.meta_address = self.meta_address
        self.map.meta_city = self.meta_city
        self.map.meta_stateorprovince = self.meta_stateorprovince
        self.map.meta_postcode = self.meta_postcode
        self.map.meta_country = self.meta_country
        self.map.meta_contactelectronicmailaddress = self.meta_contactelectronicmailaddress
        self.map.meta_contactperson = self.meta_contactperson
        self.map.meta_contactorganization = self.meta_contactorganization
        self.map.meta_contactposition = self.meta_contactposition
        self.map.meta_role = self.meta_role
        self.map.meta_contactvoicetelephone = self.meta_contactvoicetelephone
        self.map.meta_contactfacsimiletelephone = self.meta_contactfacsimiletelephone
        self.map.meta_contactinstructions = self.meta_contactinstructions
        self.map.meta_hoursofservice = self.meta_hoursofservice
        
        for output in self.execution.processOutputs:
            
            output.writeToDisk(self.pathFilesGML);
            
            providedTitle = self.outputs[output.identifier]
            dataSet = DataSet(output.filePath, providedTitle, output.identifier)
            self.dataSets.append(dataSet)
                                   
            if dataSet.dataType == dataSet.TYPE_VECTOR:
                #* style = UMN.MapStyle()
                style = MapStyle()
                #* layer = UMN.VectorLayer(
                layer = VectorLayer(
                    output.filePath, 
                    dataSet.getBBox(), 
                    dataSet.getEPSG(), 
                    output.identifier,
                    providedTitle)
                type = str(dataSet.getGeometryType())
                if type <> None:
                    layer.layerType = type
                else:
                    layer.layerType = "Polygon"
                self.logger.debug("The layer type: " + str(dataSet.getGeometryType()))
                layer.addStyle(style)
                self.map.addLayer(layer)
                self.logger.debug("Generated layer " + layer.name + " of type " + layer.layerType + ".")
                  
            elif dataSet.dataType == dataSet.TYPE_RASTER:
                #layer = UMN.RasterLayer(
                layer = RasterLayer(
                    output.filePath, 
                    dataSet.getBBox(), 
                    dataSet.getEPSG(), 
                    output.identifier,
                    providedTitle)
                layer.setBounds(dataSet.getMaxValue(), dataSet.getMinValue())
                self.map.addLayer(layer)
                self.logger.debug("Generated layer " + layer.name + " of type raster.")
                
            else:
                self.logger.warning(self.WARN_02 + output.identifier + self.WARN_03)
                
            self.logger.debug("Guessed mime type for this layer: " + str(dataSet.getMimeType()))
            
            print "The pixel res: " + str(dataSet.getPixelRes())
                
        if (len(self.map.layers) > 0):
                    
            try :
                self.map.writeToDisk()
            except Exception, e:
                self.logger.error(self.ERR_07 + str(e))
                raise Exception(self.ERR_07 + str(e))
                return
            
            self.logger.info(self.SUCC_02 + self.map.filePath())
            return self.map.filePath()
        
        else:
            
            self.logger.info(self.WARN_04)
            return None
        
        
    def getMapFilePath(self):
        """
        Is this method really needed?
        :returns: string with the path to the generated map file
        """
       
        if self.map <> None:
            return self.map.filePath()
        else:
            return None     
        
    
    def getMapFileTitle(self):
        """
        :returns: title of the generated map file
        """
        if self.map <> None:
            return self.map.serviceTitle
        else:
            return None 