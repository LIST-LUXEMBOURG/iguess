'''
Created on Aug 9, 2012

@author: Luis de Sousa [luis.desousa@tudor.lu]

This file contains classes that serve as wrappers for the several components of
a MapServer map file. It can produce a sample map file with a single layer if 
no arguments are passed to the constructors. 

Issues:
. Not yet taking into account layer EPSG
. No support for PostGis layers. 
'''

class MapFile:
    """ 
    This class wraps up a MapServer map file containing vector data. The layers 
    exposed are provided through both the WMS, WCS and WFS standards. 
    
    :param nameInit: string with the name for the map file
    
    .. attribute:: name
        Name of the map file; used as the file name in the disk
        
    .. attribute:: bBox
        List of numerical values with the cartographic bounds of the map file
    
    .. attribute:: shapePath
        Path to the spatial data sets that are published by this map file

    .. attribute:: serviceTitle
        String describing the services provided by this map file
    
    .. attribute:: mapTemplate
        Path to the MapServer map template
    
    .. attribute:: imagePath
        Path to the MapServer images folder
    
    .. attribute:: imageURL
        URL to the MapServer images folder
    
    .. attribute:: mapServerURL
        URL to the instance of MapServer processing this map file
    
    .. attribute:: mapFilesPath
        Path to the folder where to store this map file
    
    .. attribute:: otherProjs
        String listing EPSG codes of further coordinate systems to be provided
        by this map file
    
    .. attribute:: layers
        List of Layer objects composing this map file
    """

    name            = None 
    bBox            = (91979, 436326, 92617, 437659.5)
    shapePath       = "/home/desousa/Tudor/MUSIC/Rotterdam"
    epsgCode        = "28992"
    serviceTitle    = "A mapping service generated with the iGUESS WPS Client."
    mapTemplate     = "/var/www/MapServ/map.html"
    imagePath       = "/var/www/MapServ/map_images/"
    imageURL        = "/MapServ/map_images/"
    mapServerURL    = "http://localhost/cgi-bin/mapserv?map="
    mapFilesPath    = "/var/www/MapServ/"
    otherProjs      = "EPSG:3035 EPSG:4326 EPSG:3785 EPSG:900913"
    layers          = []

    def __init__(self, nameInit = "TestMapFile"):
        
        self.name = nameInit 
        # self.mapHeader()
        
    def calculateBBoxFromLayers(self):
        """
        Calculates the minimum bounding box enclosing all the Layers composing
        this map file (listed in the layers attribute) storing the result in the
        bBox attribute
        """
        
        if len(self.layers) > 0:
            self.bBox = self.layers[0].bBox
        else:
            return
        
        for i in range (1,len(self.layers)):
            if self.layers[i].bBox[0] < self.bBox[0]:
                self.bBox[0] = self.layers[i].bBox[0]
            if self.layers[i].bBox[1] < self.bBox[1]:
                self.bBox[1] = self.layers[i].bBox[1]
            if self.layers[i].bBox[2] > self.bBox[2]:
                self.bBox[2] = self.layers[i].bBox[2]
            if self.layers[i].bBox[3] > self.bBox[3]:
                self.bBox[3] = self.layers[i].bBox[3]
                                    
    def mapHeader(self):
        """
        :returns: string with the MAP and WEB sections of the map file
        """
        
        self.calculateBBoxFromLayers()

        text  = "MAP \n"
        text += "  NAME        \"" + self.name + "\"\n"
        text += "  IMAGETYPE   PNG \n"
        text += "  EXTENT      " + str(self.bBox[0]) + " " + str(self.bBox[1]) + " " + str(self.bBox[2]) + " " + str(self.bBox[3]) + "\n"
        text += "  SIZE        400 300 \n"
        text += "  SHAPEPATH   \"" + self.shapePath + "\"\n"
        text += "  IMAGECOLOR  255 255 255 \n"
        text += "  PROJECTION \n"
        text += "   \"init=epsg:" + self.epsgCode + "\"\n"
        text += "  END \n\n"

        text += "WEB \n"
        text += "  TEMPLATE  \"" + self.mapTemplate + "\"\n"
        text += "  IMAGEPATH \"" + self.imagePath + "\"\n"
        text += "  IMAGEURL  \"" + self.imageURL + "\"\n"
        text += "  METADATA \n"
        text += "    \"ows_title\"           \"" + self.serviceTitle + "\"\n"
        text += "    \"ows_onlineresource\" \"" + self.mapServerURL + self.filePath() + "&\"\n"
        text += "    \"ows_srs\"             \"EPSG:" + self.epsgCode + " " + self.otherProjs + "\"\n"
        text += "    \"ows_bbox_extended\" \"true\"\n"
        text += "    \"ows_enable_request\" \"*\"\n\n" 

        text += "  END  # Metadata\n\n"
        text += "END  # Web\n\n"

        text += "# Start of LAYER DEFINITIONS ---------------------------------\n\n"

        return text

    def mapFooter(self):
        """
        :returns: string with closing the LAYERS section
        """

        text  = "  # End of LAYER DEFINITIONS -------------------------------\n"
        text += "END "

        return text

    def filePath(self):
        """
        :returns: Path to the map file in the disk
        """

        return self.mapFilesPath + self.name + ".map"


    def addLayer(self, layer):
        """
        Adds a Layer object to the map file
        
        :param layer: a Layer object
        """

        self.layers.append(layer)


    def getString(self):
        """
        :returns: string with the complete map file definition, including the 
        list of layers, generated from the layers attribute
        """

        result = self.mapHeader()
        # If no layer has been declared add default layer
        if len(self.layers) <= 0:
            result += VectorLayer(None, None, None).getString()
        else:
            for layer in self.layers:
                result += layer.getString()
        result += self.mapFooter()

        return result

    def writeToDisk(self):
        """
        Writes the map file to the disk location defined by the mapFilesPath, 
        name and extension attributes
        """
        
        FILE = open(self.filePath(),"w")
        FILE.write(self.getString())
        FILE.close()
        
###########################################################################

class Layer:
    """ 
    Abstract class for generic layers in a MapServer map file. 
    
    :param path: string with the path to a spatial data set
    :param bounds: list of four numerical values defining the cartographic 
        extent of the spatial data set
    :param epsg: string with EPSG code of the coordinate system of this layer
    :param nameInit: string with layer name
    
    .. attribute:: name
        Name of the layer
        
    .. attribute:: title
        Abstract describing this layer
        
    .. attribute:: bBox
        List of numerical values with the cartographic bounds of the map file
        
    .. attribute:: epsgCode
        EPSG code of the coordinate system used to define this layer
        
    .. attribute:: path
        Path to the spatial data set in the disk
    """
    
    name        = None
    title       = "A test layer"
    bBox        = None
    epsgCode    = None
    path         = None
    
    def __init__(self, path, bounds, epsg, nameInit = "TestLayer"):
        
        self.name = nameInit
        self.bBox = bounds
        self.epsgCode = epsg 
        self.path = path

###############################################################################

class RasterLayer(Layer):
    """
    Wrapper for Raster layers in a MapServer map file
        
    :param path: string with the path to a spatial data set
    :param bounds: list of four numerical values defining the cartographic 
        extent of the spatial data set
    :param epsg: string with EPSG code of the coordinate system of this layer
    :param nameInit: string with layer name
    """
    
    def __init__(self, path, bounds, epsg, nameInit = "TestLayer"):
        
        Layer.__init__(self, path, bounds, epsg, nameInit) 
        
    def getString(self):
        """
        :returns: a string with the MapServer layer definition for a map file
        """
        
        text =  "  LAYER \n"
        text += "    NAME \"" + self.name + "\"\n"
        text += "    TYPE RASTER  \n"
        text += "    STATUS OFF \n"
        text += "    DATA " + self.path + "\n"
        text += "    PROCESSING \"SCALE=AUTO\" \n\n"
        
        text += "    METADATA \n"
        text += "      \"wms_title\" \"" + self.name + "\" \n"
        text += "      \"ows_abstract\" \"" + self.title + "\"\n\n"
        text += "      \"wcs_label\"           \"" + self.name + "\"   ### required \n"
        text += "      \"wcs_rangeset_name\"   \"Range 1\"  ### required to support DescribeCoverage request \n"
        text += "      \"wcs_rangeset_label\"  \"My Label\" ### required to support DescribeCoverage request \n"
        text += "    END \n"
        text += "  END \n"
        
        return text 

###########################################################################

class VectorLayer(Layer):
    """
    Wrapper for Vector layers in a MapServer map file
        
    :param path: string with the path to a spatial data set
    :param bounds: list of four numerical values defining the cartographic 
        extent of the spatial data set
    :param epsg: string with EPSG code of the coordinate system of this layer
    :param nameInit: string with layer name
        
    .. attribute:: layerType
        Type of geometries in this layer: "Point", "Line" or "Polygon"
            
    .. attribute:: styles
        List of MapStyle objects defining the layer graphical rendition
    """

    layerType   = None
    styles       = []

    def __init__(self, path, bounds, epsg, nameInit = "TestLayer"):
        
        Layer.__init__(self, path, bounds, epsg, nameInit) 
        # self.LayerHeader()

    def layerHeader(self):
        """
        :returns: a string with the header of the MapServer layer definition
        """

        text  = "  LAYER # " + self.name + " " + str(self.layerType) + " ------------------------\n\n"
        text += "    NAME           \"" + self.name + "\"\n"
        text += "    CONNECTIONTYPE OGR\n"
        text += "    CONNECTION     \"" + str(self.path) + "\"\n"
        #text += "    DATA         " + self.name + "\n"
        text += "    STATUS         OFF \n"
        text += "    TYPE           " + str(self.layerType) + "\n"

        text += "  METADATA \n"
        text += "    \"DESCRIPTION\" \"" + self.name + "\"\n"
        text += "    \"ows_title\"   \"" + self.name + "\"\n"
        text += "  END  # Metadata \n\n"

        text += "    CLASS \n"
        text += "      NAME       \"" + self.title + "\"\n"

        return text


    def layerFooter(self):
        """
        :returns: a string with the footer of the MapServer layer definition
        """

        text  = "    END \n"
        text += "  END #" + self.name + " " + str(self.layerType) + " ------------------------\n\n"
        return text


    def addStyle(self, style):
        """
        Adds a MapStyle object to the list of styles for this layer.
        
        :param style: a MapStyle object
        """

        self.styles.append(style)


    def getString(self):
        """
        :returns: a string with the complete MapServer layer definition, 
            including a list of styles generated from the styles attribute
        """

        result = self.layerHeader()
        # If no style has been declared add default style
        if len(self.styles) <= 0:
            result += MapStyle().getString()
        else: 
            for style in self.styles:
                result += style.getString()
        result += self.layerFooter()

        return result
    

##############################################################################

class MapStyle:
    """ 
    Wrapper for the MapServer style component of a vector layer. 
    
    :param pen: string with the border width 
    :param col: string with a MapServer RGB definition for the border color 
    
    .. attribute:: penWidth
        Width of the style border 
        
    .. attribute:: colour
        Colour used to render the border 
    """

    penWidth = None
    colour = None

    def __init__(self, pen = "2", col = "160 0 0"):

        self.penWidth = pen
        self.colour = col
    
    def setColour(self, col):
        """
        Sets the style border colour
        
        :param col: a string with a MapServer RGB definition
        """

        self.colour = col

    def setPen(self, pen):
        """
        Sets the style border width
        
        :param pen: a string with the border width
        """

        self.penWidth = pen

    def getString(self):
        """       
        :returns: a string with the full MapServer definition of this style
        """

        text  = "      STYLE \n"
        text += "        COLOR        " + self.colour + "\n"
        text += "        WIDTH        " + self.penWidth + "\n"
        text += "        ANTIALIAS    TRUE \n"
        text += "      END \n"

        return text
        
