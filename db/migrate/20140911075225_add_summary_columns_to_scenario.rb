class AddSummaryColumnsToScenario < ActiveRecord::Migration
  def change
    add_column :co2_scenarios, :user_id,     :integer
    add_column :co2_scenarios, :user_id,     :text
    add_column :co2_scenarios, :assumptions, :text
    add_column :co2_scenarios, :policies,    :text
    add_column :co2_scenarios, :conclusion,  :text
    add_column :co2_scenarios, :notes,       :text
  end
end
