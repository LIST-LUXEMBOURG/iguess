/**
 * Copyright (C) 2010 - 2014 CRP Henri Tudor
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * 
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 21-02-2013
 *
 * Properties and methods to manage layer styles.
 */

var WebGIS = WebGIS || { };

// Layer types
WebGIS.SLD_SOLAR = 0;
WebGIS.SLD_GEOTH = 1;
WebGIS.SLD_POVRT = 2;
WebGIS.SLD_STOCK = 3;
WebGIS.SLD_GEOTH = 4;

WebGIS.ramps = new Array();
WebGIS.vals  = new Array();

// Solar
WebGIS.ramps[WebGIS.SLD_SOLAR] = new Array("#abd9e9", "#d5ecd4", "#ffffbf", "#eb8c6e", "#d7191c");
WebGIS.vals[WebGIS.SLD_SOLAR]  = new Array(0, 300, 600, 900, 1200);

// Geothermal
WebGIS.ramps[WebGIS.SLD_GEOTH] = new Array("#92c5de", "#c5de87", "#f7f7f7", "#e17c8c", "#ca0020");
WebGIS.vals[WebGIS.SLD_GEOTH]  = new Array(0, 25, 50, 75, 100);

// Fuel Poverty
WebGIS.ramps[WebGIS.SLD_POVRT] = new Array("#A6D96A", "#d3ec95", "#FFFFBF", "#d7191c", "#D7191C");
WebGIS.vals[WebGIS.SLD_POVRT]  = new Array(0, 25, 50, 75, 100);

// Building Stock
WebGIS.ramps[WebGIS.SLD_STOCK] = new Array("#b2abd2", "#d5d1e5", "#f7f7f7", "#e66101", "#e66101");
WebGIS.vals[WebGIS.SLD_STOCK]  = new Array(0, 25, 50, 75, 100);

// Wind 
WebGIS.ramps[WebGIS.SLD_GEOTH] = new Array("#f7f7f7", "#c5deeb", "#92c5de", "#0571b0", "#0571b0");
WebGIS.vals[WebGIS.SLD_GEOTH]  = new Array(0, 25, 50, 75, 100);


WebGIS.getStyle = function(layerName, type) 
{	
	if ((type == null) || isNaN(type) || (type < 0) || (type > 4)) return "\n"; 
	
	sld =  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
	sld += "<StyledLayerDescriptor version=\"1.0.0\"\n";
	sld += "  xmlns=\"http://www.opengis.net/sld\"\n";
	sld += "  xmlns:ogc=\"http://www.opengis.net/ogc\"\n";
	sld += "  xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n";
	sld += "  xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n";
	sld += "  xsi:schemaLocation=\"http://www.opengis.net/sld\n";
	sld += "  http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd\">\n";
	sld += "  <NamedLayer>\n";
	sld += "    <Name>" + layerName + "</Name>\n";
	sld += "     <UserStyle>\n";
	sld += "      <Title>GeoServer SLD Cook Book: Simple point</Title>\n";
	sld += "		<FeatureTypeStyle>\n";
	sld += "		 <Rule>\n";
	sld += "		   <RasterSymbolizer>\n";
	sld += "		     <ColorMap>\n";
	
	for (i = 0; i < WebGIS.ramps[type].length; i++)
		sld += "		       <ColorMapEntry color=\"" + WebGIS.ramps[type][i] + 
			   "\" quantity=\"" + WebGIS.vals[type][i] + "\" />\n";

	sld += "		     </ColorMap>\n";
	sld += "		   </RasterSymbolizer>\n";
	sld += "		 </Rule>\n";
	sld += "	   </FeatureTypeStyle>\n";
	sld += "    </UserStyle>\n";
	sld += "  </NamedLayer>\n";
	sld += "</StyledLayerDescriptor>\n"; 
	
	return sld;
};


