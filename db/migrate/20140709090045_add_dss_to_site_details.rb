class AddDssToSiteDetails < ActiveRecord::Migration
  def change
    add_column :site_details, :dss, :boolean
  end
end
