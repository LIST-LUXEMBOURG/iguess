class CreateTicketTypes < ActiveRecord::Migration
  def up
    create_table :ticket_types do |t|
      t.column :value, :string,  :null => false
      t.timestamps
    end
  end

  def down
    drop_table :ticket_types
  end
end