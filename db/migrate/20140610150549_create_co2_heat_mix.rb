class CreateCo2HeatMix < ActiveRecord::Migration
def change
    create_table :co2_heat_mixes do |t|
    t.integer "co2_source_id"
    t.integer "co2_scenario_id"
    t.integer "period"
    t.float "value"

    t.timestamps
  end

  add_index :co2_heat_mixes, :id
  add_index :co2_heat_mixes, [:co2_source_id, :co2_scenario_id, :period], 
          unique: true, name: :heat_mix_foreign_key_index

  end
end
