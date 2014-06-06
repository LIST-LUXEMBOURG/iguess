class CreateCo2EmissionFactorsTable < ActiveRecord::Migration
  def change
    create_table :co2_emission_factors do |t|
      t.integer "co2_scenario_id"
      t.integer "co2_source_id"
      t.integer "period"
      t.float "co2_factor"
      t.float "ch4_factor"
      t.float "n2o_factor"

      t.timestamps
    end

    add_index :co2_emission_factors, :id
    add_index :co2_emission_factors, [:co2_source_id,:co2_scenario_id,:period], unique: true, name: "ef_foreign_key_indx"

  end
end
