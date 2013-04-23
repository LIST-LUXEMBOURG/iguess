class CreateProcessTable < ActiveRecord::Migration
  def change
    create_table :processes do |t|
      t.integer :wps_server_id
      t.text :identifier
      t.text :title
      t.text :abstract
      t.datetime :last_seen
    end
  end
end
