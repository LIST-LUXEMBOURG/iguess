class Co2CityDefault < ActiveRecord::Base
  belongs_to :city
  has_one :co2_source
  has_one :co2_sector
end