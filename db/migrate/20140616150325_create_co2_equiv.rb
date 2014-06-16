class CreateCo2Equiv < ActiveRecord::Migration
def change
    create_table :co2_equiv do |t|
    t.string "name"
    t.float "value"

    t.timestamps
  end

  add_index :co2_equiv, :id
  add_index :co2_equiv, [:name], unique: true

  end
end
