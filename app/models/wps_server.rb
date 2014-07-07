class WpsServer < ActiveRecord::Base
  has_many :mod_configs
  has_many :wps_processes
  belongs_to :city

  before_save { self.last_seen = DateTime.now }
end
