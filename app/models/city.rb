class City < ActiveRecord::Base
  default_scope :order => "name"    # Retrieve cities sorted by name
  has_one :dataset
  has_one :mod_config
  has_many :dataserver_urls
  has_many :wps_servers
  has_many :wps_processes, through: :wps_servers
  belongs_to :site_detail
end
