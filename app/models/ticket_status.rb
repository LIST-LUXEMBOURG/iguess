class TicketStatus < ActiveRecord::Base
  has_many :tickets
end
