class CreateCo2Mix < ActiveRecord::Migration
  def change
    create_table :co2_mixes do |t|
      t.integer "co2_source_id"
      t.integer "co2_carrier_id"
      t.integer "co2_scenario_id"
      t.integer "period"
      t.float "value"
      t.float "co2_emission_factor"
      t.float "ch4_emission_factor"
      t.float "n2o_emission_factor"

      t.timestamps
    end

    add_index :co2_mix, :id
    add_index :co2_mix, [:co2_source_id,:co2_carrier_id,:co2_scenario_id,:period], unique: true, :name => 'source_carrier_scenario_period_index'
  end
end
