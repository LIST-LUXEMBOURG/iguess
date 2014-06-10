class RenameMixesTable < ActiveRecord::Migration
  def up
    rename_table :co2_mixes, :co2_elec_mixes
  end

  def down
    rename_table :co2_elec_mixes, :co2_mixes
  end
end
