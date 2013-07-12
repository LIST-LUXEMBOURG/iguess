class RenameSiteTable < ActiveRecord::Migration
    def change
        rename_table :site, :sites
    end 
end
