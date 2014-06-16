class RenameOrderField < ActiveRecord::Migration
  def up
    remove_column :co2_sources, :order
  end

  def down
    add_column :co2_sources, :order, :integer
  end
end
