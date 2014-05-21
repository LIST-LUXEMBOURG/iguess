class CreateCo2Consumption < ActiveRecord::Migration
  def change
    create_table :co2_consumption do |t|
      t.integer "period"
      t.float "value"

      t.timestamps
    end

    add_index :co2_consumption, :id

  end
end
