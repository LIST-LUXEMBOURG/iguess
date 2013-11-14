class DeleteAoiToModConfigs < ActiveRecord::Migration
  def change
	remove_column :mod_configs, :aoi
  end
end
