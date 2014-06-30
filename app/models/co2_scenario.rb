class Co2Scenario < ActiveRecord::Base
  has_many :co2_sectors, through: :co2_sector_scenario
  has_many :co2_heat_mixes,  :dependent => :destroy
  has_many :co2_elec_mixes,  :dependent => :destroy
  has_many :co2_sector_scenarios,  :dependent => :destroy
  has_many :co2_emission_factors,  :dependent => :destroy

  accepts_nested_attributes_for :co2_sector_scenarios
end