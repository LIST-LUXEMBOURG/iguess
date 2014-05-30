class CreateCo2Consumption < ActiveRecord::Migration
  def change
    create_table :co2_consumptions do |t|
      t.integer "period"
      t.float "value"

      t.timestamps
    end

    add_index :co2_consumptions, :id

  end
end
