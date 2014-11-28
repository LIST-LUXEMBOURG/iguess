class CreateTicketStatuses < ActiveRecord::Migration
  def up
    create_table :ticket_statuses do |t|
      t.column :value, :string,  :null => false 
      t.timestamps
    end
  end

  def down
    drop_table :ticket_statuses
  end
end