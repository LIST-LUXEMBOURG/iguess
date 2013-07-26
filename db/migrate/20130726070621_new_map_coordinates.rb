class NewMapCoordinates < ActiveRecord::Migration
  def change
    remove_column :cities, :minx
    remove_column :cities, :miny
    remove_column :cities, :maxx
    remove_column :cities, :maxy
    add_column :cities, :mapx, :float
    add_column :cities, :mapy, :float
  end
end
