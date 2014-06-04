class Co2SectorScenario < ActiveRecord::Base
  has_many :co2_carriers, through: :co2_consumption
  has_one :co2_sector
  has_one :co2_scenario
  has_one :co2_consumption
end