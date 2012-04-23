class CreateCities < ActiveRecord::Migration
  def change
    create_table :cities do |t|
      t.string :name
      t.string :url
      t.integer :zoom
      t.string :srs
      t.float :minx
      t.float :miny
      t.float :maxx
      t.float :maxy

      t.timestamps
    end
  end
end
