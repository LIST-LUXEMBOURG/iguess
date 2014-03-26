class RenameModConfigStatusTable < ActiveRecord::Migration
  def change
	rename_table :mod_config_status, :mod_config_statuses
  end
end
