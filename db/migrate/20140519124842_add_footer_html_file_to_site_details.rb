class AddFooterHtmlFileToSiteDetails < ActiveRecord::Migration
  def change
    add_column :site_details, :footer_html_file, :string
  end
end
