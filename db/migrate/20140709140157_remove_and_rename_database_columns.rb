class RemoveAndRenameDatabaseColumns < ActiveRecord::Migration
  def change
    remove_column :wps_servers, :deleteable
    remove_column :wps_servers, :deleted

    rename_column :config_text_inputs, :column_name, :identifier
  end
end
