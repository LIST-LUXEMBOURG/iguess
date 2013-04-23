class AddColumnsToWpsServersTable < ActiveRecord::Migration
  def change
    add_column :wps_servers, :title, :text
    add_column :wps_servers, :abstract, :text
  end
end
