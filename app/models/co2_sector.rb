class Co2Sector < ActiveRecord::Base
  belongs_to :site_detail
  has_many :co2_scenarios, through: :co2_sector_scenario
  has_many :co2_sector_scenario

  default_scope :order => 'name'
end