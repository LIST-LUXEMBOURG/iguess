class AddHeatSourceToSources < ActiveRecord::Migration
  def change
    add_column :co2_sources, :heat_source, :boolean
  end
end
