class AddNotNullsToCo2Scenarios < ActiveRecord::Migration
  def change
    change_column :co2_scenarios, :user_id, :integer, :null => false
    change_column :co2_scenarios, :last_editor, :integer, :null => false
  end
end
