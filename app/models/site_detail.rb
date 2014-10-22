class SiteDetail < ActiveRecord::Base
  has_one :site
  has_many :cities
  has_many :co2_sectors
end
