class AddAdditionalMetaTagsToSiteDetails < ActiveRecord::Migration
  def change
    add_column :site_details, :additional_meta_tags, :text
  end
end
