class AddIdentifierToConfigDatasets < ActiveRecord::Migration
  def change
    add_column :config_datasets, :input_identifier, :text
  end
end
