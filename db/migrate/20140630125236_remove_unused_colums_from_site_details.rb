class RemoveUnusedColumsFromSiteDetails < ActiveRecord::Migration
  def change
    remove_column :site_details, :logo_link_url
    remove_column :site_details, :logo_alt_text
    remove_column :site_details, :logo_img
  end
end
