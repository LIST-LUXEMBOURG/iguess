class Co2SectorScenario < ActiveRecord::Base
  has_many :co2_sources, through: :co2_consumption
  belongs_to :co2_sector
  has_one :co2_scenario
  has_one :co2_consumption

  # Want to sort these but this line makes the records read only, which is bad
  # default_scope joins(:co2_sector).order('co2_sectors.name')
end