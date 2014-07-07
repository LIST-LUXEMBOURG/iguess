class AddCityIdToWpsProcesses < ActiveRecord::Migration
  def change
    add_column :wps_processes, :city_id, :integer
  end
end
