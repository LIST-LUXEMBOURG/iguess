class AddAoiToModConfigs2 < ActiveRecord::Migration
  def change
    add_column :mod_configs, :aoi, :integer, :null => false, :default => -1
  end
end
