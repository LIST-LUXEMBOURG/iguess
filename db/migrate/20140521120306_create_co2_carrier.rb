class CreateCo2Carrier < ActiveRecord::Migration
  def change
    create_table :co2_carrier do |t|
      t.string "name"
      t.timestamps
    end

    add_index :co2_carrier, :id
    add_index :co2_carrier, :name, unique: true

  end

end
