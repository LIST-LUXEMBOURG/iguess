class Ticket < ActiveRecord::Base
  belongs_to :user
  belongs_to :ticket_status
  belongs_to :ticket_type
  
  has_many   :ticket_follow_ups
  
  # File attachment with Papperclip:
  # http://vernsconsciousness.blogspot.com/2014/01/using-paperclip-to-upload-and-display.html
  has_attached_file :image, 
    :styles => { 
      :larger => '400x400', 
      :medium => "200x200>", 
      :thumb => "100x100>" }
      
  after_create :send_ticket_mail

  def send_ticket_mail()
    #binding.pry
    TicketMailer.new_ticket(self).deliver
  end

end
