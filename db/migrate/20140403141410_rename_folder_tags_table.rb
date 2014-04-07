class RenameFolderTagsTable < ActiveRecord::Migration
  def self.up
    rename_table :folder_tags, :dataset_folder_tags
  end

 def self.down
    rename_table :dataset_folder_tags, :folder_tags
 end

end
