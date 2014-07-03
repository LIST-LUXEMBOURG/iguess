class RenameDataserverUrlsTable < ActiveRecord::Migration
    def change
        rename_table :dataserver_urls, :dataserver_bookmarks
    end 
end
