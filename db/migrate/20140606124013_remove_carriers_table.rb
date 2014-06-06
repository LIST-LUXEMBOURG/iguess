class RemoveCarriersTable < ActiveRecord::Migration
  def change
    drop_table :co2_carriers
  end
end
