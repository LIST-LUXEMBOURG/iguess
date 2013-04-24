class AddAliveColumnToProcessesTable < ActiveRecord::Migration
  def change
     add_column :processes, :alive, :boolean
  end
end
