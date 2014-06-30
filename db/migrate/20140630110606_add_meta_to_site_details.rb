class AddMetaToSiteDetails < ActiveRecord::Migration
  def change
    add_column :site_details, :meta_description, :text
    add_column :site_details, :meta_keywords, :text
  end
end
