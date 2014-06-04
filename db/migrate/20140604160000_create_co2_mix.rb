class CreateCo2Mix < ActiveRecord::Migration
  def change
    create_table :co2_mixes do |t|
	  t.integer "co2_source_id"
	  t.integer "co2_carrier_id"
	  t.integer "co2_scenario_id"
      t.integer "period"
      t.float "value"

      t.timestamps
    end

    add_index :co2_mixes, :id
   	add_index :co2_mixes, [:co2_source_id,:co2_carrier_id, :co2_scenario_id, :period], 
   				unique: true, name: :mix_foreign_key_index

  end
end
