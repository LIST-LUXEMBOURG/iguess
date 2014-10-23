class CreateCo2SourceSiteDetails < ActiveRecord::Migration
def change
    create_table :co2_source_site_details do |t|
      t.integer "co2_source_id"
      t.integer "site_detail_id"
      
      t.timestamps
    end

    add_index :co2_source_site_details, :id
    add_index :co2_source_site_details, 
              [:co2_source_id,:site_detail_id], 
              unique: true,
              name: :co2_source_site_details_unq
  end
end
