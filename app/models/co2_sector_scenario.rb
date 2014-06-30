class Co2SectorScenario < ActiveRecord::Base
  belongs_to :co2_sector
  belongs_to :co2_scenario
  # has_one :co2_scenario
  has_many :co2_sources, through: :co2_consumption
  has_many :co2_consumption,  :dependent => :destroy

  # Want to sort these but this line makes the records read only, which is bad
  # default_scope joins(:co2_sector).order('co2_sectors.name')
end