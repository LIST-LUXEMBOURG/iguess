class AddNotNullConstraintToConfigDatasetsInputIdentifierColumn < ActiveRecord::Migration
  def change
   change_column :config_datasets, :input_identifier, :text, :null => false
  end
end
