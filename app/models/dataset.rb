class Dataset < ActiveRecord::Base
  has_many :mod_configs, :through => :config_datasets
  has_many :config_datasets, :dependent => :destroy
  has_many :dataset_tags, :dependent => :destroy
  belongs_to :city
  belongs_to :dataserver
end
