class Dataset < ActiveRecord::Base
  
  
  def status()
    if server_url.blank? or identifier.blank?
      return "Incomplete"
    else
      return "OK"
    end
  end
end
