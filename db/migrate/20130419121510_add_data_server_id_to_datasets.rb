class AddDataServerIdToDatasets < ActiveRecord::Migration
  def change
    add_column :datasets, :dataserver_id, :integer
  end
end
