class AddPublishedColumnToDatasets < ActiveRecord::Migration
  def change
    add_column :datasets, :published, :boolean, :default=> false
  end
end
