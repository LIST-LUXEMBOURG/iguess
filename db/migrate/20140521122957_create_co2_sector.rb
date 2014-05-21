class CreateCo2Sector < ActiveRecord::Migration
  def change
    create_table :co2_sector do |t|
      t.string "name"
      t.timestamps
    end

    add_index :co2_sector, :id
    add_index :co2_sector, :name, unique: true

  end
end
