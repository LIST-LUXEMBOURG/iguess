class AddTabListToSiteDetails < ActiveRecord::Migration
  def change
    add_column :site_details, :tab_list, :text
  end
end
