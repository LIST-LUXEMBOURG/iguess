class RemoveIdCarrierFromCo2Mix < ActiveRecord::Migration
  def up
    remove_column :co2_mixes, :co2_carrier_id
  end

  def down
    add_column :co2_mixes, :co2_carrier_id, :integer
  end
end
