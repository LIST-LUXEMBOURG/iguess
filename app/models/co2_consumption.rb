class Co2Consumption < ActiveRecord::Base
	has_one :co2_sector_scenario
	has_one :co2_carrier
end