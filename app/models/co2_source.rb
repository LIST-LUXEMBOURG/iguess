class Co2Source < ActiveRecord::Base
  has_many :co2_mixes, :foreign_key => :carrier_id
  has_many :co2_sources, :through => :co2_mixes, :source => :co2_source_id

  has_many :co2_consumptions
  has_many :co2_emission_factors

  default_scope :order => 'name'
end