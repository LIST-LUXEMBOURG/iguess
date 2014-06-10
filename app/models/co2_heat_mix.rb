class Co2HeatMix < ActiveRecord::Base
  belongs_to :co2_source,  :class_name => :Co2Source
  belongs_to :co2_scenario
end