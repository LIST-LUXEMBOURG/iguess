class AddDeleteableToWpsServers < ActiveRecord::Migration
  def change
    add_column :wps_servers, :deleteable, :boolean, :null => false, :default => true
  end
end
