class Co2Carrier < ActiveRecord::Base
	has_many :co2_sourcess, through: :co2_mix
end