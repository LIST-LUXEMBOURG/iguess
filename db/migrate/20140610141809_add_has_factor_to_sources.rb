class AddHasFactorToSources < ActiveRecord::Migration
  def change
  end
    add_column :co2_sources, :has_factor, :boolean
end
