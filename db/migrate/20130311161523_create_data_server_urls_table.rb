class CreateDataServerUrlsTable < ActiveRecord::Migration
  def up
	create_table :dataserver_urls do |t|
		t.integer :city_id
		t.text :url
          	t.text :descr
	end
  end

  def down
	drop_table :dataserver_urls
  end
end

