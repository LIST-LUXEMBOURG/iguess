class RemoveDescrFromDataserverUrls < ActiveRecord::Migration
  def up
    remove_column :dataserver_urls, :descr
  end

  def down
    add_column :dataserver_urls, :descr, :text
  end
end
