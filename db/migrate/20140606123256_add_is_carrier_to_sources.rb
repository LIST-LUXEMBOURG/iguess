class AddIsCarrierToSources < ActiveRecord::Migration
  def change
    add_column :co2_sources, :is_carrier, :boolean
  end
end
