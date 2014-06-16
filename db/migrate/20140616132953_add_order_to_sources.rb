class AddOrderToSources < ActiveRecord::Migration
  def change
    add_column :co2_sources, :order, :integer
  end
end
