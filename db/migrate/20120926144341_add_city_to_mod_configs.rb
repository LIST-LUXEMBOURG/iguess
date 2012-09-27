class AddCityToModConfigs < ActiveRecord::Migration
  def change
    add_column :mod_configs, :city_id, :integer

  end
end
