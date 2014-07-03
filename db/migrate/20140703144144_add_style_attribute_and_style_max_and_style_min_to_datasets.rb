class AddStyleAttributeAndStyleMaxAndStyleMinToDatasets < ActiveRecord::Migration
  def change
    add_column :datasets, :style_attribute, :string
    add_column :datasets, :style_min, :float
    add_column :datasets, :style_max, :float
  end
end
