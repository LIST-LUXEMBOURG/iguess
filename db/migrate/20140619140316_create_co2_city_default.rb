class CreateCo2CityDefault < ActiveRecord::Migration
  def change
    create_table :co2_city_defaults do |t|
      t.integer "city_id"
      t.integer "co2_source_id"
      t.integer "co2_sector_id"
      t.float "value"

      t.timestamps
    end

    add_index :co2_city_defaults, :id
    add_index :co2_city_defaults, [:city_id,:co2_source_id,:co2_sector_id], unique: true, :name => 'city_defaults_source_sector_index'
  end
end