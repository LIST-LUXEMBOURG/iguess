class AddUniqueConstraintToWpsServers < ActiveRecord::Migration
  def change
    add_index :wps_servers, :url, unique: true
  end
end
