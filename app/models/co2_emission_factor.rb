class Co2EmissionFactor < ActiveRecord::Base
  belongs_to :co2_scenario
  belongs_to :co2_source
end
