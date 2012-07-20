class Dataset < ActiveRecord::Base

  has_many :mod_configs, :through => :config_datasets
  has_many :config_datasets, :dependent => :destroy

  def status()
    if server_url.blank? or identifier.blank?
      return "Incomplete"
    else
      return "OK"
    end
  end
end
