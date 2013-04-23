class RenameProcesses < ActiveRecord::Migration
  def change
    rename_table :processes, :wps_processes
  end
end
