class AddServiceToDatasets < ActiveRecord::Migration
  def change
    add_column :datasets, :service, :text
  end
end
