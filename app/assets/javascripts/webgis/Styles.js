/**
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
WebGIS.ramps[WebGIS.SLD_SOLAR]  = [["#abd9e9"],["#ffffbf"],["#d7191c"]];
WebGIS.vals[WebGIS.SLD_SOLAR]   = [0, 600, 1200];

// Geothermal
WebGIS.ramps[WebGIS.SLD_GEOTH]  = [["#92c5de"],["#f7f7f7"],["#ca0020"]];
WebGIS.vals[WebGIS.SLD_GEOTH]   = [0, 50, 100];

// Fuel Poverty
WebGIS.ramps[WebGIS.SLD_POVRT]  = [["#A6D96A"],["#FFFFBF"],["#D7191C"]];
WebGIS.vals[WebGIS.SLD_POVRT]   = [0, 50, 100];

// Building Stock
WebGIS.ramps[WebGIS.SLD_STOCK]  = [["#b2abd2"],["#f7f7f7"],["#e66101"]];
WebGIS.vals[WebGIS.SLD_STOCK]   = [0, 50, 100];

// Wind 
WebGIS.ramps[WebGIS.SLD_GEOTH]  = [["#f7f7f7"],["#92c5de"],["#0571b0"]];
WebGIS.vals[WebGIS.SLD_GEOTH]   = [0, 50, 100];


WebGIS.getStyle = function(layerName, type) {
	
	if ((type == null) || isNaN(type) || (type < 0) || (type > 4)) return ""; 
	
	sld =  "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
	sld += "<StyledLayerDescriptor version=\"1.0.0\"";
	sld += "  xmlns=\"http://www.opengis.net/sld\"";
	sld += "  xmlns:ogc=\"http://www.opengis.net/ogc\"";
	sld += "  xmlns:xlink=\"http://www.w3.org/1999/xlink\"";
	sld += "  xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"";
	sld += "  xsi:schemaLocation=\"http://www.opengis.net/sld";
	sld += "  http://schemas.opengis.net/sld/1.0.0/StyledLayerDescriptor.xsd\">";
	sld += "  <NamedLayer>";
	sld += "    <Name>" + layerName + "</Name>";
	sld += "     <UserStyle>";
	sld += "      <Title>GeoServer SLD Cook Book: Simple point</Title>";
	sld += "		<FeatureTypeStyle>";
	sld += "		 <Rule>";
	sld += "		   <RasterSymbolizer>";
	sld += "		     <ColorMap>";
	
	for (i = 0; i < ramps[type].lenght; i++)
		sld += "		       <ColorMapEntry color=\"" + ramps[type][i] + "\" quantity=\"" + vals[type][i] + "\" />";

	sld += "		     </ColorMap>";
	sld += "		   </RasterSymbolizer>";
	sld += "		 </Rule>";
	sld += "	   </FeatureTypeStyle>";
	sld += "    </UserStyle>";
	sld += "  </NamedLayer>";
	sld += "</StyledLayerDescriptor>"; 
	
	return sld;
}


