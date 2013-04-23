class ChangeIdColumnName < ActiveRecord::Migration
  def change
    rename_column :process_params, :process_id, :wps_process_id
  end
end
