class AddForeignKeysToCo2Consumptions < ActiveRecord::Migration
  def change
    add_column :co2_consumptions, :co2_carrier_id, :integer
    add_column :co2_consumptions, :co2_sector_scenario_id, :integer

    add_index :co2_consumptions, [:co2_carrier_id,:co2_sector_scenario_id, :period], unique: true, name: :foreign_key_index

  end
end
