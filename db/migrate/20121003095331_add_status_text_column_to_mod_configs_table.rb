class AddStatusTextColumnToModConfigsTable < ActiveRecord::Migration
  def change
    add_column :mod_configs, :status_text, :text, :default => ''

  end
end
