class CreateFolderTagsTable < ActiveRecord::Migration
  def change
    create_table :folder_tags do |t|
      t.integer "dataset_id"
      t.string "folder_tag"
    end
  end
end
