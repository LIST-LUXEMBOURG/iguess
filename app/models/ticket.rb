class Ticket < ActiveRecord::Base
  belongs_to :user
  belongs_to :ticket_status
  belongs_to :ticket_type
  
  has_many   :ticket_follow_ups
end
