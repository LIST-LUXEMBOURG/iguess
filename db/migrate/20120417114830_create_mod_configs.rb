class CreateModConfigs < ActiveRecord::Migration
  def change
    create_table :mod_configs do |t|
      t.integer :wps_server_id
      t.text :identifier
      t.text :name
      t.text :descr

      t.timestamps
    end
  end
end
