class AddAboutHtmlFileToSiteDetails < ActiveRecord::Migration
  def change
    add_column :site_details, :about_html_file, :text
  end
end
