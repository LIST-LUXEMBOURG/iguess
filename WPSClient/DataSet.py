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
	"""

	dataSet=None
	dataType=None
	spatialReference=None
	min=None
	max=None

	def __init__(self, path):

		self.dataType = self.getDataSet(path)
		if self.dataType == None:
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
			self.min = int(round(self.min)) - 1
			self.max = int(round(self.max)) + 1
			return "raster"

		if not self.dataSet:
			logging.debug("Trying to import [%s] using ogr" % path)
			self.dataSet = ogr.Open(path)

		if self.dataSet:
			return "vector"
		else:
			logging.error("It wasn't possible to import the dataset using gdal or ogr.")
			return None

	def getSpatialReference(self):
		"""
		Loads the Spatial Reference System defined in the data set, storing it
		in the spatialReference attribute.
		"""

		sr = osr.SpatialReference()
		if self.dataType == "raster":
			wkt = self.dataSet.GetProjection()
			res = sr.ImportFromWkt(wkt)
			if res == 0:
				self.spatialReference = sr
		elif self.dataType == "vector":
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
		:returns: bounding box of the dataset
		"""

		if self.dataType == "raster":
			geotransform = self.dataSet.GetGeoTransform()
			#height = self.dataSet.RasterYSize
			#width = self.dataSet.RasterXSize
			return (geotransform[0],
				    geotransform[3]+geotransform[5]*self.dataSet.RasterYSize,
				    geotransform[0]+geotransform[1]*self.dataSet.RasterXSize,
				    geotransform[3])
		else:
			layer = self.dataSet.GetLayer()
			return layer.GetExtent()
		
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




