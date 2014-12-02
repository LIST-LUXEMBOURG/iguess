class Ticket < ActiveRecord::Base
  belongs_to :user
  belongs_to :ticket_status
  belongs_to :ticket_type
  
  has_many   :ticket_follow_ups
  
  # Image storage tutorial:
  # http://archive.railsforum.com/viewtopic.php?id=4642
  def image_file=(input_data)
    #self.filename = input_data.original_filename
    #self.content_type = input_data.content_type.chomp
    self.image = input_data.read
  end
end
