class ConfigDataset < ActiveRecord::Base
  belongs_to :dataset
  belongs_to :mod_config
end