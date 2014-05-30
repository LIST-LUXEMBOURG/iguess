class CreateCo2Scenario < ActiveRecord::Migration
  def change
    create_table :co2_scenarios do |t|
      t.integer "city_id"

      t.integer "base_year"
      t.integer "time_step"
      t.string "name"
      t.string "description"

      t.timestamps
    end

    add_index :co2_scenarios, :id
    add_index :co2_scenarios, [:name,:city_id], unique: true

  end
end
