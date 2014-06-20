class AddAliveToConfigTextInputs < ActiveRecord::Migration
  def change
    add_column :config_text_inputs, :alive, :boolean
  end
end
