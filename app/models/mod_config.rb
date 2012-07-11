class ModConfig < ActiveRecord::Base
  belongs_to :wps_server
  has_many :datasets, :through => :config_datasets
  has_many :config_text_inputs
end
Data
