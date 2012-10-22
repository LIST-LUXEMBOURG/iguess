# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).


[['Aberdeen',    '', 12, 'EPSG:900913', -243400, -227700, 7782600, 7801700],
 ['Gent',        '', 12, 'EPSG:31370',  407000,  423200, 6622900, 6644600],
 ['Ludwigsburg', 'http://logis.ludwigsburg.de/mapguide2011/mapagent/mapagent.fcgi', 13, 'EPSG:31467', 3495664, 3536658, 5406951, 5429311],
 ['Montreuil',   '', 13, 'EPSG:2154',  268000,  276000, 6249000, 6254000],
 ['Rotterdam',   '', 12, 'EPSG:28992',  91983.63, 92756.79, 437119.25, 437826.60]
].each do |v|
  c = City.find_or_create_by_name v[0]
  c.url = v[1]
  c.zoom = v[2]
  c.srs = v[3]
  c.minx = v[4]
  c.maxx = v[5]
  c.miny = v[6]
  c.maxy = v[7]
  c.save
end