class RemoveDatasetTypeFromDatasets < ActiveRecord::Migration
  def up
    remove_column :datasets, :dataset_type
  end

  def down
    add_column :datasets, :dataset_type, :text
  end
end
