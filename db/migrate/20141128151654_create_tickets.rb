class CreateTickets < ActiveRecord::Migration
  def up
    create_table :tickets do |t|
      t.column :title,            :string,  :null => false
      t.column :description,      :string,  :null => false
      t.column :ticket_type_id,   :integer, :null => false 
      t.column :ticket_status_id, :integer, :null => false
      t.column :user_id,          :integer, :null => false 
      t.column :image,            :binary
      t.timestamps
    end
  end

  def down
    drop_table :tickets
  end
end