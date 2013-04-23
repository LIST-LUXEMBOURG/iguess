class AddAliveColumnToProcessesParamsTable < ActiveRecord::Migration
  def change
    add_column :process_params, :alive, :boolean
  end
end
