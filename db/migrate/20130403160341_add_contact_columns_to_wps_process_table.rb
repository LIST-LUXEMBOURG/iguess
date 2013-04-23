class AddContactColumnsToWpsProcessTable < ActiveRecord::Migration
  def change
    add_column(:wps_servers, :provider_name, :text)
    add_column(:wps_servers, :contact_name, :text)
    add_column(:wps_servers, :contact_email, :text)
  end
end
