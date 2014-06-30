class RemoveMoreUnusedColumsFromSiteDetails < ActiveRecord::Migration
  def change
    remove_column :site_details, :subtitle   
  end
end
