class AddAttachmentImageToTickets < ActiveRecord::Migration
  def self.up
    change_table :tickets do |t|
      t.attachment :image
    end
  end

  def self.down
    drop_attached_file :tickets, :image
  end
end
