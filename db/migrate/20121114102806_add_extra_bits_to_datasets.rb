class AddExtraBitsToDatasets < ActiveRecord::Migration
  def change
   add_column :datasets, :full_url, :text, :default => '', :null => false
  end
end

