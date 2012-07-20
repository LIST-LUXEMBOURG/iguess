class ModConfig < ActiveRecord::Base
  belongs_to :wps_server

  has_many :datasets, :through => :config_datasets
  has_many :config_datasets, :dependent => :destroy       # This line exists only to delete records from config_datasets
                                                          # when the underlying config is deleted

  has_many :config_text_inputs, :dependent => :destroy    # :dependent => :destroy deletes text entries when we delete a config
end

