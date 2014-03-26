class RenameModConfigStatusesTable < ActiveRecord::Migration
  def change
     rename_table :mod_config_statuses, :run_statuses
  end
end
