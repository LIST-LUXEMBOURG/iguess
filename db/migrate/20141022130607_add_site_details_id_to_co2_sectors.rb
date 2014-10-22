class AddSiteDetailsIdToCo2Sectors < ActiveRecord::Migration
  def change
    add_column :co2_sectors, :site_details_id, :integer
  end
end
