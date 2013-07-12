class CreateSiteTable < ActiveRecord::Migration
  def change
    create_table :site do |t|
      t.text :base_url
      t.text :title
    end
  end
end
