class CreateCo2Source < ActiveRecord::Migration
  def change
    create_table :co2_source do |t|
      t.string "name"
      t.timestamps
    end

    add_index :co2_source, :id
    add_index :co2_source, :name, unique: true
  end
end
