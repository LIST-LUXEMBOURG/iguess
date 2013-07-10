class AddDeletedColumnToWpsServers < ActiveRecord::Migration
  def change
    add_column :wps_servers, :deleted, :boolean, :null => false, :default => false
  end
end
