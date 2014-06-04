class AddHasMixToCo2Carriers < ActiveRecord::Migration
  def change
    add_column :co2_carriers, :has_mix, :boolean
  end
end
