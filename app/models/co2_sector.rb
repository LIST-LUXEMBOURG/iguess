class Co2Sector < ActiveRecord::Base
  has_many :co2_scenarios, through: :co2_sector_scenario
  has_many :co2_sector_scenario

  default_scope :order => 'name'
end