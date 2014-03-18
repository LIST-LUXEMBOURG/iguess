class AddProjectionParamsToCities < ActiveRecord::Migration
  def change
    add_column :cities, :projection_params, :string
  end
end
