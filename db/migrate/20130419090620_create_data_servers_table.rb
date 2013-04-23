class CreateDataServersTable < ActiveRecord::Migration
  def change
    create_table :data_servers do |t|
      t.text :url
      t.text :title
      t.text :abstract
      t.timestamp :last_seen
      t.boolean :alive
      t.boolean :wms
      t.boolean :wfs
      t.boolean :wcs
    end
  end
end
