class RenameDataServersTable < ActiveRecord::Migration
  def self.up
    rename_table :data_servers, :dataservers
  end

 def self.down
    rename_table :dataservers, :data_servers
 end
end
