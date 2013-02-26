class RenameDatasetIdColumnToDatasetsId < ActiveRecord::Migration
  def change
    rename_column :dataset_tags, :dataset_id, :datasets_id
  end
end
