class Co2Mix < ActiveRecord::Base
	has_one :co2_source
	has_one :co2_carrier
	has_one :co2_scenario
end