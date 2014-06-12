class AddFactorsToSources < ActiveRecord::Migration
  def change
    add_column :co2_sources, :co2_factor, :float
    add_column :co2_sources, :ch4_factor, :float
    add_column :co2_sources, :n2o_factor, :float
  end
end
