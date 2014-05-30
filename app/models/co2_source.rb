class Co2Source < ActiveRecord::Base
  has_many :co2_carriers, through: :co2_mix
end