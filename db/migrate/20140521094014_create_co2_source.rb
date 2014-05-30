class CreateCo2Source < ActiveRecord::Migration
  def change
    create_table :co2_sources do |t|
      t.string "name"
      t.timestamps
    end

    add_index :co2_sources, :id
    add_index :co2_sources, :name, unique: true
  end
end
