class AddInputOutputIndicatorToConfigTextInputsTable < ActiveRecord::Migration
  def change
    add_column :config_text_inputs, :is_input, :boolean
  end
end
