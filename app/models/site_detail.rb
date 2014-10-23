class SiteDetail < ActiveRecord::Base
  has_one  :site
  has_many :cities
  
  has_many :co2_sectors
  has_many :co2_source_site_details
end
