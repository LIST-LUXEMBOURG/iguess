class CO2_Consumption < ActiveRecord::Base
	has_many :co2_sector_scenarios, through: :co2_consumption
end