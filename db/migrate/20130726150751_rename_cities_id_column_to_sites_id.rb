class RenameCitiesIdColumnToSitesId < ActiveRecord::Migration
  def change
    rename_column :cities, :city_details_id, :site_details_id
  end
end
