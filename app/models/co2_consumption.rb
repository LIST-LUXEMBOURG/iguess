class Co2Consumption < ActiveRecord::Base
  belongs_to :co2_sector_scenario
  has_one :co2_carrier
end
