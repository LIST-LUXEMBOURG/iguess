class RemoveUrlFromCities < ActiveRecord::Migration
  def up
    remove_column :cities, :url
  end

  def down
    add_column :cities, :url, :varchar
  end
end
