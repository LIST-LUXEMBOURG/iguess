class CreateProcessParamsTable < ActiveRecord::Migration
  def change
    create_table :process_params do |t|
      t.integer :process_id
      t.text :identifier
      t.text :title
      t.text :abstract
      t.text :datatype
      t.boolean :is_input
    end
  end
end
