class AddLegalHtmlFileToSiteDetails < ActiveRecord::Migration
  def change
    add_column :site_details, :legal_html_file, :text
  end
end
