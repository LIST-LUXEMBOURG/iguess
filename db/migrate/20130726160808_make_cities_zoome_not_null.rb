class MakeCitiesZoomeNotNull < ActiveRecord::Migration
  def change
    change_column :cities, :zoom, :integer, :null => false
  end
end
