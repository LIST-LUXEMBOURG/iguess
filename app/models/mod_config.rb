class ModConfig < ActiveRecord::Base
  belongs_to :wps_server
  belongs_to :city

  has_many :datasets, :through => :config_datasets
  has_many :config_datasets, :dependent => :destroy

  has_many :config_text_inputs, :dependent => :destroy    # :dependent => :destroy deletes text entries when we delete a config
end

