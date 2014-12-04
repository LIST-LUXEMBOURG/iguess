class TicketStatus < ActiveRecord::Base
  has_many :tickets
  
  def self.getOpenId()
    return self.find_by_value("Open").id
  end
  
    def self.getClosedId()
    return self.find_by_value("Closed").id
  end
end
