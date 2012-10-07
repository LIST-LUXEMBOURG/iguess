class CreateConfigTextInputsTable < ActiveRecord::Migration
  def change
    create_table :config_text_inputs do |t|
      t.integer :mod_config_id, :null => false
      t.text :column_name,      :null => false
      t.text :value
    end
  end
end
