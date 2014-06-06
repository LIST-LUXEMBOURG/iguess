class Co2EmissionFactor < ActiveRecord::Base
  belongs_to :co2_source
  belongs_to :co2_scenario
end