'''
Created on Sep 26, 2012

@author: Luis de Sousa [luis.desousa@tudor.lu]

Contains tools to build a WPS request with XML to be used in a HTTP Post.
'''

import urllib2

class XMLPost:
    """
    Wraps the XML request for an HTTP Post to a WPS server.
    
    :param procName: string with the name of the process to be invoked
        
    .. attribute:: inputs
        List of strings with the '<wps:Input>' section of each process input
            
    .. attribute:: outputs
        List of strings with the <wps:Output > section of each process output
            
    .. attribute:: procName
        Name of the process to invoke.
    """
    
    inputs = []
    outputs = []
    procName = None
    
    def __init__(self, procName):
        
        self.procName = procName
        
    def getHeader(self):
        """
        :returns: string with the header of the XML request, containing the 
        required schema definitions.
        """
        
        s  = "<wps:Execute service=\"WPS\" version=\"1.0.0\" \n"
        s += " xmlns:wps=\"http://www.opengis.net/wps/1.0.0\" \n"
        s += " xmlns:ows=\"http://www.opengis.net/ows/1.1\" \n"
        s += " xmlns:xlink=\"http://www.w3.org/1999/xlink\" \n"
        s += " xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" \n"
        s += " xsi:schemaLocation=\"http://www.opengis.net/wps/1.0.0 http://schemas.opengis.net/wps/1.0.0/wpsExecute_request.xsd\">\n"
        s += " <ows:Identifier>" + self.procName + "</ows:Identifier>\n"
        return s
        
    def addRefInput(self, name, address):
        """
        Adds a new reference input (WFS, WCS, remote file, etc) to the request, 
        generating the required <wps:Input> XML section and storing it in the 
        inputs attribute.
        
        :param name: string with the input name
        :param address: string with the reference to pass as input
        """
        
        s  = "  <wps:Input>\n"
        s += "   <ows:Identifier>" + name + "</ows:Identifier>\n"
        s += "   <wps:Reference xlink:href=\"" + address + "\"/>\n"
        s += "  </wps:Input>\n"
        self.inputs.append(s)
        
    def addLiteralInput(self, name, value):
        """
        Adds a new literal input to the request, generating the required 
        <wps:Input> XML section and storing it in the inputs attribute.
        
        :param name: string with the input name
        :param value: string with the value to pass as input
        """
        
        s  = "  <wps:Input>\n"
        s += "   <ows:Identifier>" + name + "</ows:Identifier>\n"
        s += "   <wps:Data>\n"
        s += "    <wps:LiteralData>" + value + "</wps:LiteralData>\n"
        s += "   </wps:Data>\n"
        s += "  </wps:Input>\n"
        self.inputs.append(s)
        
    def addOutput(self, name):
        """
        Adds a new onput to the request, generating the required 
        <wps:Output> XML section and storing it in the outputs attribute.
        
        :param name: string with the output name
        """
        
        s  = "   <wps:Output asReference=\"true\">\n"
        s += "    <ows:Identifier>" + name + "</ows:Identifier>\n"
        s += "   </wps:Output>\n"
        self.outputs.append(s)
        
    def getFooter(self):
        """
        :returns: string with the footer of the XML request, including the 
        output list, generated from the outputs attribute
        """
        
        s  = " <wps:ResponseForm>\n"
        s += "  <wps:ResponseDocument storeExecuteResponse=\"true\" status=\"true\">\n"
        for o in self.outputs:
            s += o
        s += "  </wps:ResponseDocument>\n"
        s += " </wps:ResponseForm>\n"
        s += "</wps:Execute>\n"
        return s
        
    def getString(self):
        """
        :returns: string with the complete XML request, including the header,
        the inputs list, generated from the inputs attribute and the footer
        """
        
        s = self.getHeader()
        s += " <wps:DataInputs>\n"
        for i in self.inputs:
            s += i
        s += " </wps:DataInputs>\n"
        s += self.getFooter()
        return s
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        