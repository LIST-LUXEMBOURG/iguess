class RenameDatasetsIdColumnToDatasetId < ActiveRecord::Migration
  def change
    rename_column :dataset_tags, :datasets_id, :dataset_id
  end
end
