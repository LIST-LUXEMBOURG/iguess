class CreateConfigDatasetTable < ActiveRecord::Migration
  def change
    create_table :config_datasets do |t|
      t.integer :dataset_id, :null => false
      t.integer :mod_config_id, :null => false
    end
  end
end
