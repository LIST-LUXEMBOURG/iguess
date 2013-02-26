class CreateDatasetTagsTable < ActiveRecord::Migration
  def up
      create_table :dataset_tags do |t|
          t.integer :dataset_id
          t.text :tag
      end
  end

  def down
      drop_table :dataset_tags
  end
end
