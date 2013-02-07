class AddSeveralColumnsToConfigDatasets < ActiveRecord::Migration
  def change
     add_column :config_datasets, :format, :text
     add_column :config_datasets, :bbox_left, :float
     add_column :config_datasets, :bbox_right, :float
     add_column :config_datasets, :bbox_top, :float
     add_column :config_datasets, :bbox_bottom, :float
     add_column :config_datasets, :crs, :text
     add_column :config_datasets, :res_x, :float
     add_column :config_datasets, :res_y, :float
  end
end
