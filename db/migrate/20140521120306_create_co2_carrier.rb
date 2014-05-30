class CreateCo2Carrier < ActiveRecord::Migration
  def change
    create_table :co2_carriers do |t|
      t.string "name"
      t.timestamps
    end

    add_index :co2_carriers, :id
    add_index :co2_carriers, :name, unique: true

  end

end
