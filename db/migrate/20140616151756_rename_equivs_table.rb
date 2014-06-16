class RenameEquivsTable < ActiveRecord::Migration
  def up
    rename_table :co2_equiv, :co2_equivs
  end

  def down
    rename_table :co2_equivs, :co2_equiv
  end
end
