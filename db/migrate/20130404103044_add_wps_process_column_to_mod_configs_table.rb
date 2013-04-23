class AddWpsProcessColumnToModConfigsTable < ActiveRecord::Migration
  def change
    add_column :mod_configs, :wps_process_id, :integer
  end
end
