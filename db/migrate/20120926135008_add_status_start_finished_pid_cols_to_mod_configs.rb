class AddStatusStartFinishedPidColsToModConfigs < ActiveRecord::Migration
  def change
    add_column :mod_configs, :status, :text

    add_column :mod_configs, :run_started, :timestamp

    add_column :mod_configs, :run_ended, :timestamp

    add_column :mod_configs, :pid, :text

  end
end
