class SiteDetail < ActiveRecord::Base
  has_one :site
  has_many :cities
end
