class AddCityIdToWpsServers < ActiveRecord::Migration
  def change
    add_column :wps_servers, :city_id, :integer
  end
end
