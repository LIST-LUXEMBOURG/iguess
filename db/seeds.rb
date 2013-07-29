# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).


[['Aberdeen',    '', 13, 'EPSG:27700', -235500, 7790000],
 ['Gent',        'http://gentgis2.gent.be/arcgisserver/services/G_WIS/testIvago/MapServer/WFSServer', 12, 'EPSG:31370',  415000,  6632500],
 ['Ludwigsburg', 'http://logis.ludwigsburg.de/mapguide2011/mapagent/mapagent.fcgi', 14, 'EPSG:31467', 497500, 6257200]
 ['Montreuil',   'http://montreuil.dynmap.com/carte_pour_iguess/carteWS.php', 14, 'EPSG:2154',  272000,  6250800],
 ['Rotterdam',   'http://ows.gis.rotterdam.nl/cgi-bin/mapserv.exe?map=d:\gwr\webdata\mapserver\map\gwr_basis_pub.map', 12, 'EPSG:28992', 497500,  6786500],
 ['Brussels',    '', 12, 'EPSG:31370', 484517,  6594220],
 ['London',      '', 13, 'EPSG:27700', -8468,  6711661],
 ['Luxembourg',  '', 13, 'EPSG:2169', 682574,  6379134],
 ['Esch-sur-Alzette', '', 14, 'EPSG:2169', 665606,  6359849]
].each do |v|
  c = City.find_or_create_by_name v[0]
  c.url =  v[1]
  c.zoom = v[2]
  c.srs =  v[3]
  c.mapx = v[4]
  c.mapy = v[5]
  c.save
end