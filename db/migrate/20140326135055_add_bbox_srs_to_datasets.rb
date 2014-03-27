class AddBboxSrsToDatasets < ActiveRecord::Migration
  def change
    add_column :datasets, :bbox_srs, :text
  end
end
