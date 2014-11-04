class AddLastEditorCo2Scenarios < ActiveRecord::Migration
  def change
    add_column :co2_scenarios, :last_editor, :integer
  end
end
