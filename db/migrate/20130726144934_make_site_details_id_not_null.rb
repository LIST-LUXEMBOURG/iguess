class MakeSiteDetailsIdNotNull < ActiveRecord::Migration
  def change
    change_column :sites, :site_details_id, :integer, :null => false
  end
end
