class AddAvailableAndLastseenColumnsToWpsTerversTable < ActiveRecord::Migration
  def change
    add_column :wps_servers, :last_seen, :datetime
    add_column :wps_servers, :alive, :boolean 
  end
end
