class AddAoiToModConfigs < ActiveRecord::Migration
  def change
    add_column :mod_configs, :aoi, :integer, :null => false, :default => 0
  end
end
