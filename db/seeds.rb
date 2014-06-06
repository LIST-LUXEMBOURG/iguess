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
[['Industry'], ['Road Transport'], ['Rail Transport'], ['Navigation Transport'],
 ['Tertiary'], ['Residential'] ,   ['Agriculture']
 ].each do |v|
	sector = Co2Sector.find_or_create_by_name v[0]
end


# Basic energy sources for the CO2 model
[['Coal', false],       ['Gas', false],         ['Oil', false],     ['Wind', false],    
 ['Hydraulic', false],  ['Excess Heat', false], ['Imports', false], ['Solar', false],
 ['Geothermal', false], ['Waste', false],       ['Biogaz', false],  ['Wood', false],
 ['Heat', true],        ['Electricity', true],  ['LPG', false],     ['Gasoline', false],
 ['Diesel', false],     ['LPG', false],         ['Other', false]
].each do |v|
  sector = Co2Source.find_or_create_by_name v[0]
  sector.is_carrier = v[1]
  sector.save
end



