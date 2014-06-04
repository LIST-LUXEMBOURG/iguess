class Co2Carrier < ActiveRecord::Base
	has_many :co2_sourcess, through: :co2_mix
	has_one :co2_consumption
end