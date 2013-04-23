class WpsServer < ActiveRecord::Base
  has_many :mod_configs
  has_many :wps_processes
  has_many :process_params, :through => :wps_processes
end
