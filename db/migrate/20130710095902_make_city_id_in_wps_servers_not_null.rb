class MakeCityIdInWpsServersNotNull < ActiveRecord::Migration
  def change
    change_column :wps_servers, :city_id, :integer, { null: false }
  end
end
