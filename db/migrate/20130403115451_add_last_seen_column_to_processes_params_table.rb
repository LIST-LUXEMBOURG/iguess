class AddLastSeenColumnToProcessesParamsTable < ActiveRecord::Migration
  def change
    add_column :process_params, :last_seen, :datetime
  end
end
