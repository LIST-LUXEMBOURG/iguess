class AddSiteDetailsToSiteTable < ActiveRecord::Migration
  def change
    add_column :sites, :site_details_id, :integer
  end
end
