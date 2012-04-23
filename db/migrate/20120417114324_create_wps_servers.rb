class CreateWpsServers < ActiveRecord::Migration
  def change
    create_table :wps_servers do |t|
      t.string :url
      t.text :descr

      t.timestamps
    end
  end
end
