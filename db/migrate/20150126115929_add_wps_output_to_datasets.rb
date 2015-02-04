class AddWpsOutputToDatasets < ActiveRecord::Migration
  def change
    add_column :datasets, :wps_output, :boolean, :default => false
  end
end
