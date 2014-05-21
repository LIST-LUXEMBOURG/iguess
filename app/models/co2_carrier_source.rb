class CO2_Mix < ActiveRecord::Base
  belongs_to :co2_carriers
  belongs_to :co2_sources
  belongs_to :co2_scenarios
end