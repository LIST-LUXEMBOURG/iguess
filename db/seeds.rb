# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).

# I believe we should no longer be storing this data in the seeds file -CE

# If any of these values need to be updated, please do so directly in the Cities table in the database!

# Note that the bounding box data below appear to be incorrect.  Don't rely on them unless they are corrected and this comment removed -CE
# [['Aberdeen',    '', 13, 'EPSG:27700', -235500, 7790000],
#  ['Gent',        'http://gentgis2.gent.be/arcgisserver/services/G_WIS/testIvago/MapServer/WFSServer', 12, 'EPSG:31370',  415000,  6632500],
#  ['Ludwigsburg', 'http://logis.ludwigsburg.de/mapguide2011/mapagent/mapagent.fcgi', 14, 'EPSG:31467', 497500, 6257200]
#  ['Montreuil',   'http://montreuil.dynmap.com/carte_pour_iguess/carteWS.php', 14, 'EPSG:2154',  272000,  6250800],
#  ['Rotterdam',   'http://ows.gis.rotterdam.nl/cgi-bin/mapserv.exe?map=d:\gwr\webdata\mapserver\map\gwr_basis_pub.map', 12, 'EPSG:28992', 497500,  6786500],
#  ['Brussels',    '', 12, 'EPSG:31370', 484517,  6594220],
#  ['London',      '', 13, 'EPSG:27700', -8468,  6711661],
#  ['Luxembourg',  '', 13, 'EPSG:2169', 682574,  6379134],
#  ['Esch-sur-Alzette', '', 14, 'EPSG:2169', 665606,  6359849]
# ].each do |v|
#   c = City.find_or_create_by_name v[0]
#   c.url =  v[1]
#   c.zoom = v[2]
#   c.srs =  v[3]
#   c.mapx = v[4]
#   c.mapy = v[5]
#   c.save
# end


# Basic sectors for the CO2 model
[['Industry'], ['Road Transport'], ['Rail Transport'], ['Ship Transport'],
 ['Tertiary'], ['Residential'] ,   ['Agriculture']
 ].each do |v|
	sector = Co2Sector.find_or_create_by_name v[0]
end


# Basic energy sources for the CO2 model
[['Coal',             true,  true,  true,  true,  0.3406, 36.0,  5.4,   1],
 ['Gas',              true,  true,  true,  true,  0.266,  36.0,  2.16,  2],
 ['CHP',              true,  true,  true,  true,  0.0,     0.0,  0.0,   3],
 ['Crude Oil',        true,  true,  true,  true,  0.263,  36.0,  2.16,  4],
 ['Diesel',           true,  true,  false, false, 0.266,  36.0,  2.16,  5],
 ['Gasoline',         true,  true,  false, false, 0.249,  36.0,  2.16,  6],
 ['LPG',              true,  true,  false, false, 0.227,  18.0,  0.36,  7],  
 ['Biogas',           true,  true,  true,  true,  0.196,  18.0,  0.36,  8],
 ['Excess Heat',      false, true,  false, true,  0.0,     0.0,  0.0,   9],
 ['Waste',            false, true,  true,  true,  0.33, 1080.0, 14.4,  10],
 ['Imports',          false, true,  true,  true,  0.24,   34.0, 34.0,  11],
 ['District Heating', true,  false, false, false, 0.0,     0.0,  0.0,  12],
 ['Electricity',      true,  false, false, false, 0.0,     0.0,  0.0,  13],
 ['Other Fossil',     true,  true,  true,  true,  0.0,     0.0,  0.0,  14],
 ['Geothermal',       true,  true,  true,  true,  0.0,     0.0,  0.0,  55],
 ['Hydraulic',        false, true,  true,  false, 0.0,     0.0,  0.0,  56],  
 ['Solar',            false, true,  true,  true,  0.0,     0.0,  0.0,  57],
 ['Wind',             false, true,  true,  false, 0.0,     0.0,  0.0,  58],
 ['Wood',             true,  true,  true,  true,  0.0,     0.0,  0.0,  59],
 ['Other renewables', true, true,   true,  false, 0.0,     0.0,  0.0,  60]
].each do |v|
  source = Co2Source.find_or_create_by_name v[0]
  source.is_carrier = v[1]
  source.has_factor = v[2]
  source.electricity_source = v[3]
  source.heat_source = v[4]
  source.co2_factor = v[5]
  source.ch4_factor = v[6]
  source.n2o_factor = v[7]
  source.display_order = v[8]
  source.save
end

# Conversion factors to CO2 equivalent
[['CH4',   25],
 ['N2O',  298]
].each do |v|
  equiv = Co2Equiv.find_or_create_by_name v[0]
  equiv.value = v[1]
  equiv.save
end

# Decision support - present or not the DSS button in the maps tab 
[['iguess.css',   true],
 ['lamilo.css',  false],
 ['list.css',    false]  
].each do |v|
  equiv = SiteDetail.find_or_create_by_stylesheet v[0]
  equiv.dss = v[1]
  equiv.save
end


