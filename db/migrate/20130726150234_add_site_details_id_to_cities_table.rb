class AddSiteDetailsIdToCitiesTable < ActiveRecord::Migration
  def change
    add_column :cities, :city_details_id, :integer
  end
end
