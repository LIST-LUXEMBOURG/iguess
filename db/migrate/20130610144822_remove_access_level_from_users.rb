class RemoveAccessLevelFromUsers < ActiveRecord::Migration
  def up
    remove_column :users, :access_level
      end

  def down
    add_column :users, :access_level, :integer
  end
end
