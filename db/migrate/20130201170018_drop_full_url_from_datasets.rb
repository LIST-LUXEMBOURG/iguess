class DropFullUrlFromDatasets < ActiveRecord::Migration
  def change
    remove_column :datasets, :full_url
  end
end
