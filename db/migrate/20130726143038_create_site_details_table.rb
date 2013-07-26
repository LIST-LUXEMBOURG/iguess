class CreateSiteDetailsTable < ActiveRecord::Migration
  def change
    create_table :site_details do |t|
      t.text :subtitle
      t.text :stylesheet
      t.text :logo_img
      t.text :logo_alt_text
      t.text :logo_link_url
    end
  end
end
