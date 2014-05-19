class AddBodyHtmlFileToSiteDetails < ActiveRecord::Migration
  def change
    add_column :site_details, :body_html_file, :string
  end
end
