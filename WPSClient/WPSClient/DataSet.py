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

Created on Aug 21, 2012

@author: Luis de Sousa [luis.desousa@tudor.lu]

Module providing tools to retrieve information from spatial datasets stored 
in the disk. This code is inspired in the UMN module of the PyWPS project [1].

[1] http://wiki.rsg.pml.ac.uk/pywps/Main_Page
'''

import logging
import fileinput
import mimetypes

gdal=False
#try:
from osgeo import gdal
from osgeo import ogr
from osgeo import osr
#except Exception,e:
#    gdal=False

DEBUG = True

class DataSet:
	"""
	Wraps spatial data sets stored in the disk. Provides methods to retrieve 
	useful information on the data set. 
	
	:param path: string with the path to the physical data set.
		
	.. attribute:: dataSet
		GDAL object wrapping the spatial data set
			
	.. attribute:: dataType
		Data set type: "raster" or "vector"
			
	.. attribute:: spatialReference
		EPSG code of the coordinate system used by data set 
		
	.. attribute:: min
		Minimum value (for raster datasets)
		
	.. attribute:: max
		Maximum value (for raster datasets)
				
	.. attribute:: name
		Maximum value (for raster datasets)
				
	.. attribute:: value
		Stores the value for literal type data sets
				
	.. attribute:: uniqueID
		Stores the unique ID for this data set
				
	.. attribute:: path
		Path to the data set in disk
	"""

	dataSet=None
	dataType=None
	spatialReference=None
	min=None
	max=None
	
	name=None
	value=""
	uniqueID=None
	path=None
	
	TYPE_VECTOR  = "vector" 
	TYPE_RASTER  = "raster"
	TYPE_LITERAL = "literal"


	def __init__(self, path, name, uniqueID):
		
		self.name = name
		self.uniqueID = uniqueID
		self.path = path

		self.dataType = self.getDataSet(path)
		
		if self.dataType == self.TYPE_LITERAL:
			return
		
		self.getSpatialReference()
		
		logging.debug("Read a data set of type " + str(self.dataType))
		logging.debug("It has the following SRS: " + str(self.getEPSG()))
		logging.debug("And the following bounds: " + str(self.getBBox()))


	def getDataSet(self, path):
		"""
		Attempts to create a GDAL object wrapping the spatial set. Tried to
		import it first as a raster and then as vector and stores it in the
		dataSet attribute.
		
		:param path: string with the path to the physical data set 
		:returns: "raster" or "vector", None in case of error
		"""

		logging.debug("Trying to import [%s] using gdal" % path)
		#If dataset is XML it will make an error like ERROR 4: `/var/www/html/wpsoutputs/vectorout-26317EUFxeb' not recognised as a supported file format.
		self.dataSet = gdal.Open(path)

		if self.dataSet:
			band = self.dataSet.GetRasterBand(1)
			self.min = band.GetMinimum()
			self.max = band.GetMaximum()
			if self.min is None or self.max is None:
				(self.min,self.max) = band.ComputeRasterMinMax(1)
			return self.TYPE_RASTER

		if not self.dataSet:
			logging.debug("Trying to import [%s] using ogr" % path)
			self.dataSet = ogr.Open(path)

		if self.dataSet:
			return self.TYPE_VECTOR
		else:
			logging.info("It wasn't possible to import the dataset using gdal or ogr. Assuming literal type.")
			#** Not very efficient, reading what was just written
			for line in fileinput.input(path):
				self.value += str(line)
			return self.TYPE_LITERAL
			return None


	def getSpatialReference(self):
		"""
		Loads the Spatial Reference System defined in the data set, storing it
		in the spatialReference attribute.
		"""

		sr = osr.SpatialReference()
		if self.dataType == self.TYPE_RASTER:
			wkt = self.dataSet.GetProjection()
			res = sr.ImportFromWkt(wkt)
			if res == 0:
				self.spatialReference = sr
		elif self.dataType == self.TYPE_VECTOR:
			layer = self.dataSet.GetLayer()
			ref = layer.GetSpatialRef()
			if ref:
				self.spatialReference = ref


	def getEPSG(self):
		"""
		:returns: Spatial Reference System EPSG code
		"""

		code=None
		if self.spatialReference == None:
			return None
		
		if self.spatialReference.IsProjected():
			code = self.spatialReference.GetAuthorityCode("PROJCS")
		else:
			code = self.spatialReference.GetAuthorityCode("GEOGCS")
		return code


	def getBBox(self):
		"""
		:returns: dataset bounding box [minX, maxX, minY, maxY]
		"""

		if self.dataType == self.TYPE_RASTER:
			geotransform = self.dataSet.GetGeoTransform()
			return (geotransform[0],
				    geotransform[0]+geotransform[1]*self.dataSet.RasterXSize,
				    geotransform[3]+geotransform[5]*self.dataSet.RasterYSize,
				    geotransform[3])
		else:
			layer = self.dataSet.GetLayer()
			return layer.GetExtent()
		
		
	def getPixelRes(self):
		"""
		:returns: pixel resolution [width, height]
		"""		
		if self.dataType == self.TYPE_RASTER:
			geotransform = self.dataSet.GetGeoTransform()
			return (abs(geotransform[1]), abs(geotransform[5]))
		
		
	def getMimeType(self):
		"""
		:returns: a guessed mime type for this data set
		"""		
		if self.path is None:
			return None
		mimetypes.init()
		return mimetypes.guess_type(self.path)[0]

		
	def getDriver(self):
		"""
		:returns: format driver (long name), e.g. GeoTIFF
		"""
		if self.dataType == self.TYPE_RASTER:
			return self.dataSet.GetDriver().LongName
		
		
	def getGeometryType(self):
		"""
		:returns: string with type of geometry in a vector layer: "Point", 
		"Line" or "Polygon"
		"""
		
		layer = self.dataSet.GetLayer()
		if layer <> None:
			type = ogr.GeometryTypeToName(layer.GetGeomType())
			if "Point" in type:
				return "Point"
			if "Line" in type:
				return "Line"
			if "Polygon" in type:
				return "Polygon"
		return None
	
	
	def getMaxValue(self):
		"""
		:returns: The maximum value of the data set (if raster type)
		"""
		return self.max
		
		
	def getMinValue(self):
		"""
		:returns: The minimum value of the data set (if raster type)
		"""
		return self.min




