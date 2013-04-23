class WpsProcess < ActiveRecord::Base
  belongs_to :wps_server
  has_many :process_param
  has_many :mod_config
end