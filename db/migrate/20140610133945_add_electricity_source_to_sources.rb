class AddElectricitySourceToSources < ActiveRecord::Migration
  def change
    add_column :co2_sources, :electricity_source, :boolean
  end
end
