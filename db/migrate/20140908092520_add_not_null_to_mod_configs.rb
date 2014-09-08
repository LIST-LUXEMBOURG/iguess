class AddNotNullToModConfigs < ActiveRecord::Migration
  def change
    change_column :mod_configs, :wps_server_id, :integer, :null => false
  end
end
