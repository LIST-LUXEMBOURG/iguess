class MakeCitiesSiteDetailsIdNotNull < ActiveRecord::Migration
  def change
    change_column :cities, :city_details_id, :integer, :null => false
  end
end
