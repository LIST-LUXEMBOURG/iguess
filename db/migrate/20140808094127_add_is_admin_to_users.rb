class AddIsAdminToUsers < ActiveRecord::Migration
  def change
    add_column :users, :is_admin, :boolean, :default => false, :null => false
  end
end
