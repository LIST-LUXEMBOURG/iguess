class ChangeTicketDescriptionLength < ActiveRecord::Migration
  def up
    change_column :tickets, :description, :text, :limit => nil
  end

  def down
  end
end
