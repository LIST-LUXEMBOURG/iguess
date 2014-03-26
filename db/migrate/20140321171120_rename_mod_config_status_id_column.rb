class RenameModConfigStatusIdColumn < ActiveRecord::Migration
  def change
    rename_column :mod_configs, :mod_config_status_id, :run_status_id
  end
end
