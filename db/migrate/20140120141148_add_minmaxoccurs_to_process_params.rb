class AddMinmaxoccursToProcessParams < ActiveRecord::Migration
  def change
    add_column :process_params, :min_occurs, :integer, :null=>false, :default=>1
    add_column :process_params, :max_occurs, :integer, :null=>false, :default=>1
  end
end
