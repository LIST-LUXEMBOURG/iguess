# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rake db:seed (or created alongside the db with db:setup).

# Site details
[['smartcitylog-agadir.css',
  'smartcitylog-agadir_homepage_body.html.erb',
  'smartcitylog-agadir_footer.html.erb',
  'smartcitylog-agadir_banner.html.erb',
  'home, maps, datamanager, modules, about',
  false,
  'smartcitylog-agadir_about.html.erb',
  'smartcitylog-agadir_legal.html.erb']
].each do |v|
    d = SiteDetail.find_or_create_by_stylesheet v[0]
    d.body_html_file = v[1]
    d.footer_html_file = v[2]
    d.top_banner_file = v[3]
    d.tab_list = v[4]
    d.dss = v[5]
    d.about_html_file = v[6]
    d.legal_html_file = v[7]
    d.save
end

# Add Support tab to MUSIC site
d = SiteDetail.find_by_stylesheet('iguess.css')
d.tab_list = 'home, datamanager, modules, scenarios, maps, about, support'
d.save


# ------------------ Sites ------------------ #

[['smartcitylog-agadir.tudor.lu', 'Smart City Logistics', 'smartcitylog-agadir.css'],
 ['test.smartcitylog-agadir.tudor.lu', 'Smart City Logistics [Test]', 'smartcitylog-agadir.css']
].each do |v|
    s = Site.find_by_base_url v[0]
    if s == nil
      s = Site.new
      s.base_url = v[0]
    end
    s.title = v[1]
    s.site_details_id = SiteDetail.find_by_stylesheet(v[2]).id
    s.save
end

# ---------- LIST sites ---------- #

[[     'iguess.list.lu',              'iGUESS',                            1],
 ['test.iguess.list.lu',              'iGUESS [Test]',                     1],
 [     'iguess-sl.list.lu',           'iGUESS-SL',                         2],
 ['test.iguess-sl.list.lu',           'iGUESS-SL [Test]',                  2],
 [     'iguess-list.list.lu',         'iGUESS-LIST',                       3],
 ['test.iguess-list.list.lu',         'iGUESS-LIST [Test]',                3],
 [     'hydro-atlas.list.lu',         'Hydro-Climatological Atlas',        4],
 ['test.hydro-atlas.list.lu',         'Hydro-Climatological Atlas [Test]', 4],
 [     'ecosystems.list.lu',          'Ecosystem Services',                5],
 ['test.ecosystems.list.lu',          'Ecosystem Services [Test]',         5],
 [     'smartcitylog-agadir.list.lu', 'Smart City Logistics',              7],
 ['test.smartcitylog-agadir.list.lu', 'Smart City Logistics [Test]',       7]
].each do |v|
  s = Site.find_or_create_by_base_url_and_site_details_id(v[0], v[2])
  s.title = v[1]
  s.save
end

# New titles for the MUSIC site

['iguess-rails.kirchberg.tudor.lu',
 'iguess.list.lu',
 'iguess.tudor.lu',
].each do |url|
    s = Site.find_by_base_url url
    s.title = 'Smart City Energy'
    s.save
end

['test.iguess.tudor.lu',
 'test.iguess.list.lu'
].each do |url|
    s = Site.find_by_base_url url
    s.title = 'Smart City Energy [Test]'
    s.save
end

['0.0.0.0',
 'localhost'
].each do |url|
    s = Site.find_by_base_url url
    s.title = 'Smart City Energy [Local]'
    s.save
end

# ------------------ Cities ------------------ #


# Correct Marroco to Morocco
if (city = City.find_by_name 'Marroco')
  city.name = 'Morocco'
  city.save
end

# Correct Morroco to Morocco
if (city = City.find_by_name 'Morroco')
  city.name = 'Morocco'
  city.save
end

# I believe we should no longer be storing this data in the seeds file -CE

# If any of these values need to be updated, please do so directly in the Cities table in the database!

# Luís: Why were the seeds for the cities table commented out? 
#       This way the seeds file and the database will diverge.
#       It could become an important source of errors.

# Note that the bounding box data below appear to be incorrect.  Don't rely on them unless they are corrected and this comment removed -CE
[
#  ['Aberdeen',    '', 13, 'EPSG:27700', -235500, 7790000],
#  ['Gent',        'http://gentgis2.gent.be/arcgisserver/services/G_WIS/testIvago/MapServer/WFSServer', 12, 'EPSG:31370',  415000,  6632500],
#  ['Ludwigsburg', 'http://logis.ludwigsburg.de/mapguide2011/mapagent/mapagent.fcgi', 14, 'EPSG:31467', 497500, 6257200]
#  ['Montreuil',   'http://montreuil.dynmap.com/carte_pour_iguess/carteWS.php', 14, 'EPSG:2154',  272000,  6250800],
#  ['Rotterdam',   'http://ows.gis.rotterdam.nl/cgi-bin/mapserv.exe?map=d:\gwr\webdata\mapserver\map\gwr_basis_pub.map', 12, 'EPSG:28992', 497500,  6786500],
#  ['Brussels',    '', 12, 'EPSG:31370', 484517,  6594220],
#  ['London',      '', 13, 'EPSG:27700', -8468,  6711661],
#  ['Luxembourg',  '', 13, 'EPSG:2169', 682574,  6379134],
#  ['Esch-sur-Alzette', '', 14, 'EPSG:2169', 665606,  6359849]
  ['Brussels',    12, 'EPSG:3035',    484517, 6594220, 'lamilo.css', '+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +units=m +no_defs'],
  ['Agadir',      13, 'EPSG:26192', -1066445, 3557502, 'smartcitylog-agadir.css', '+proj=lcc +lat_1=33.3 +lat_0=33.3 +lon_0=-5.4 +k_0=0.999625769 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356515 +towgs84=31,146,47,0,0,0,0 +units=m +no_defs '],
  ['Morocco',      6, 'EPSG:26192',  -800000, 3600000, 'smartcitylog-agadir.css', '+proj=lcc +lat_1=33.3 +lat_0=33.3 +lon_0=-5.4 +k_0=0.999625769 +x_0=500000 +y_0=300000 +a=6378249.2 +b=6356515 +towgs84=31,146,47,0,0,0,0 +units=m +no_defs '],
  ['Ludwigsburg', 13, 'EPSG:25832',  1022893, 6257460, 'iguess.css', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs '],
  ['Bergamo',     13, 'EPSG:32632',  1076114, 5731384, 'lamilo.css', '+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs '],
  ['Torino',      12, 'EPSG:32632',   857160, 5632548, 'iguess.css', '+proj=utm +zone=32 +ellps=WGS84 +datum=WGS84 +units=m +no_defs ']
].each do |v|
   c = City.find_by_name v[0]
   if c == nil
     c = City.new
     c.name = v[0]
   end
   c.zoom = v[1]
   c.srs  = v[2]
   c.mapx = v[3]
   c.mapy = v[4]
   c.site_details_id = SiteDetail.find_by_stylesheet(v[5]).id
   c.projection_params = v[6]
   c.save
end

# ------------------ CO2 Scenarios ------------------ #

# Basic sectors for the CO2 model
[# MUSIC site_details_id: 1
 ['Industry', 1], 
 ['Road Transport', 1], 
 ['Rail Transport', 1], 
 ['Ship Transport', 1],
 ['Tertiary', 1], 
 ['Residential', 1],   
 ['Agriculture', 1],
 # LaMiLo"  site_details_id: 2
 ['Cars', 2],
 ['Trucks', 2],
 ['Vans', 2],
 ['Buses', 2],
 ['Motorcycles', 2]
 ].each do |v|
	sector = Co2Sector.find_or_create_by_name v[0]
	sector.site_details_id = v[1]
	sector.save
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
 ['Other renewables', true,  true,  true,  false, 0.0,     0.0,  0.0,  60]
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

# Sources for MUSIC
detail = SiteDetail.find_by_stylesheet("iguess.css")
Co2Source.find_each do |s|
  Co2SourceSiteDetail.find_or_create_by_co2_source_id_and_site_detail_id(s.id, detail.id)
end

# Sources for LaMiLo
detail = SiteDetail.find_by_stylesheet("lamilo.css")
['Gas','Diesel','Gasoline','LPG','Biogas','Electricity'].each do |name|
  s = Co2Source.find_by_name(name)
  Co2SourceSiteDetail.find_or_create_by_co2_source_id_and_site_detail_id(s.id, detail.id)
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

# Replicate the country of Luxembourg
[['GD Luxembourg',  10, 'EPSG:2169', 682574,  6415000, 4, '+proj=tmerc +lat_0=49.83333333333334 +lon_0=6.166666666666667 +k=1 +x_0=80000 +y_0=100000 +ellps=intl +towgs84=-193,13.7,-39.3,-0.41,-2.933,2.688,0.43 +units=m +no_defs '],
 ['GD Luxembourg',  10, 'EPSG:2169', 682574,  6415000, 5, '+proj=tmerc +lat_0=49.83333333333334 +lon_0=6.166666666666667 +k=1 +x_0=80000 +y_0=100000 +ellps=intl +towgs84=-193,13.7,-39.3,-0.41,-2.933,2.688,0.43 +units=m +no_defs '],
 ["Luxembourg",     13, "EPSG:2169", 682574,  6379134, 4, "+proj=tmerc +lat_0=49.83333333333334 +lon_0=6.166666666666667 +k=1 +x_0=80000 +y_0=100000 +ellps=intl +towgs84=-193,13.7,-39.3,-0.41,-2.933,2.688,0.43 +units=m +no_defs"],
 ["Luxembourg",     13, "EPSG:2169", 682574,  6379134, 5, "+proj=tmerc +lat_0=49.83333333333334 +lon_0=6.166666666666667 +k=1 +x_0=80000 +y_0=100000 +ellps=intl +towgs84=-193,13.7,-39.3,-0.41,-2.933,2.688,0.43 +units=m +no_defs"],  
].each do |v|
  c = City.find_by_name_and_site_details_id(v[0],v[5])
  if c == nil
    c = City.new
  end
  c.name = v[0]
  c.zoom = v[1]
  c.srs  = v[2]
  c.mapx = v[3]
  c.mapy = v[4]
  c.site_details_id = v[5]
  c.projection_params = v[6]
  c.save
end

# LaMiLo - set the tab list 
[['lamilo.css',  'home, maps, datamanager, modules, scenarios, about']  
].each do |v|
  equiv = SiteDetail.find_by_stylesheet v[0]
  equiv.tab_list = v[1]
  equiv.save
end

# ---------- LIST sites ---------- #

[[     'iguess.list.lu',              'iGUESS',                            1],
 ['test.iguess.list.lu',              'iGUESS [Test]',                     1],
 [     'iguess-sl.list.lu',           'iGUESS-SL',                         2],
 ['test.iguess-sl.list.lu',           'iGUESS-SL [Test]',                  2],
 [     'iguess-list.list.lu',         'iGUESS-LIST',                       3],
 ['test.iguess-list.list.lu',         'iGUESS-LIST [Test]',                3],
 [     'hydro-atlas.list.lu',         'Hydro-Climatological Atlas',        4],
 ['test.hydro-atlas.list.lu',         'Hydro-Climatological Atlas [Test]', 4],
 [     'ecosystems.list.lu',          'Ecosystem Services',                5],
 ['test.ecosystems.list.lu',          'Ecosystem Services [Test]',         5],
 [     'smartcitylog-agadir.list.lu', 'Smart City Logistics',              7],
 ['test.smartcitylog-agadir.list.lu', 'Smart City Logistics [Test]',       7]
].each do |v|
  s = Site.find_or_create_by_base_url_and_site_details_id(v[0], v[2])
  s.title = v[1]
  s.save
end

# ---------- Tickets ---------- #

# Types
['Information',  'Bug', 'New feature'].each do |v|
  TicketType.find_or_create_by_value v
end

# Statuses
['Open',  'Processing', 'Closed'].each do |v|
  TicketStatus.find_or_create_by_value v
end


