class AddModConfigStatusIdToModConfigs < ActiveRecord::Migration
  def change
    add_column :mod_configs, :mod_config_status_id, :integer, :null => false, :default => 1
  end
end
