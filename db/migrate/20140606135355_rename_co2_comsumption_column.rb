class RenameCo2ComsumptionColumn < ActiveRecord::Migration
  def change
    rename_column :co2_consumptions, :co2_carrier_id, :co2_source_id
  end
end
