class CreateTicketFollowUps < ActiveRecord::Migration
  def up
    create_table :ticket_follow_ups do |t|
      t.column :description, :string,  :null => false
      t.column :user_id,     :integer, :null => false 
      t.column :ticket_id,   :integer, :null => false
      t.timestamps
    end
  end

  def down
    drop_table :ticket_follow_ups
  end
end