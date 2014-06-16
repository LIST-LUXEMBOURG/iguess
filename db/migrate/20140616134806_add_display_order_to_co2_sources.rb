class AddDisplayOrderToCo2Sources < ActiveRecord::Migration
  def change
    add_column :co2_sources, :display_order, :integer
  end
end
