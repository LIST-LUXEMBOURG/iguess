class AddTopBannerFileToSiteDetails < ActiveRecord::Migration
  def change
    add_column :site_details, :top_banner_file, :text
  end
end
