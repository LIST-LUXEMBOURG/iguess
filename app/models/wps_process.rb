class WpsProcess < ActiveRecord::Base
  belongs_to :wps_server
  has_many :process_params, :dependent => :destroy
  has_many :mod_configs
end