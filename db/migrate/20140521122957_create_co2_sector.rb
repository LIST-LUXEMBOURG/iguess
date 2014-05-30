class CreateCo2Sector < ActiveRecord::Migration
  def change
    create_table :co2_sectors do |t|
      t.string "name"
      t.timestamps
    end

    add_index :co2_sectors, :id
    add_index :co2_sectors, :name, unique: true

  end
end
