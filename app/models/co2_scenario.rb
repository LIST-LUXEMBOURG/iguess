class Co2Scenario < ActiveRecord::Base
  has_many :co2_sectors, through: :co2_sector_scenario
  has_many :co2_mixes
end