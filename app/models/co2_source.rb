class Co2Source < ActiveRecord::Base
  has_many :co2_heat_mixes
  has_many :co2_elec_mixes

  has_many :co2_consumptions
  has_many :co2_emission_factors
  
  has_many :co2_source_site_details

  default_scope :order => 'display_order'
end