class Co2SectorScenario < ActiveRecord::Base
  has_many :co2_carriers, through: :co2_consumption
end