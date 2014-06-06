class Co2Scenario < ActiveRecord::Base
  has_many :co2_sectors, through: :co2_sector_scenario
  has_many :co2_mixes
  has_many :co2_sector_scenarios
  has_many :co2_emission_factors

  accepts_nested_attributes_for :co2_sector_scenarios
end