class AddBookmarkTypeToDataserverBookmarks < ActiveRecord::Migration
  def change
    add_column :dataserver_bookmarks, :bookmark_type, :integer
  end
end
