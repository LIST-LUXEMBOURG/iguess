class CreateDatasets < ActiveRecord::Migration
  def change
    create_table :datasets do |t|
      t.string :server_url, :null => false
      t.string :identifierLstring, :null => false
      t.string :dataset_type, :null => true
      t.integer :city_id
      t.boolean :finalized, :null => false, :default => true

      t.timestamps
    end
  end
end
