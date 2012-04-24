class Dataset < ActiveRecord::Base
  
  has_many :mod_configs, :through => :config_datasets
  
  def status()
    if server_url.blank? or identifier.blank?
      return "Incomplete"
    else
      return "OK"
    end
  end
end
