# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20141203142458) do

  create_table "cities", :force => true do |t|
    t.string   "name"
    t.integer  "zoom",              :null => false
    t.string   "srs"
    t.float    "mapx"
    t.float    "mapy"
    t.datetime "created_at",        :null => false
    t.datetime "updated_at",        :null => false
    t.integer  "site_details_id",   :null => false
    t.string   "projection_params"
  end

  create_table "cities", :force => true do |t|
    t.string   "name"
    t.integer  "zoom",              :null => false
    t.string   "srs"
    t.float    "mapx"
    t.float    "mapy"
    t.datetime "created_at",        :null => false
    t.datetime "updated_at",        :null => false
    t.integer  "site_details_id",   :null => false
    t.string   "projection_params"
  end

  create_table "co2_carrier_source", :force => true do |t|
    t.integer  "co2_source_id"
    t.integer  "co2_carrier_id"
    t.integer  "period"
    t.float    "value"
    t.float    "co2_emission_factor"
    t.float    "ch4_emission_factor"
    t.float    "n2o_emission_factor"
    t.datetime "created_at",          :null => false
    t.datetime "updated_at",          :null => false
  end

  add_index "co2_carrier_source", ["co2_source_id", "co2_carrier_id", "period"], :name => "source_carrier_period_index", :unique => true
  add_index "co2_carrier_source", ["id"], :name => "index_co2_carrier_source_on_id"

  create_table "co2_city_defaults", :force => true do |t|
    t.integer  "city_id"
    t.integer  "co2_source_id"
    t.integer  "co2_sector_id"
    t.float    "value"
    t.datetime "created_at",    :null => false
    t.datetime "updated_at",    :null => false
  end

  add_index "co2_city_defaults", ["city_id", "co2_source_id", "co2_sector_id"], :name => "city_defaults_source_sector_index", :unique => true
  add_index "co2_city_defaults", ["id"], :name => "index_co2_city_defaults_on_id"

  create_table "co2_consumptions", :force => true do |t|
    t.integer  "period"
    t.float    "value"
    t.datetime "created_at",             :null => false
    t.datetime "updated_at",             :null => false
    t.integer  "co2_source_id"
    t.integer  "co2_sector_scenario_id"
  end

  add_index "co2_consumptions", ["co2_source_id", "co2_sector_scenario_id", "period"], :name => "foreign_key_index", :unique => true
  add_index "co2_consumptions", ["id"], :name => "index_co2_consumptions_on_id"

  create_table "co2_elec_mixes", :force => true do |t|
    t.integer  "co2_source_id"
    t.integer  "co2_scenario_id"
    t.integer  "period"
    t.float    "value"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  add_index "co2_elec_mixes", ["id"], :name => "index_co2_mixes_on_id"

  create_table "co2_emission_factors", :force => true do |t|
    t.integer  "co2_scenario_id"
    t.integer  "co2_source_id"
    t.integer  "period"
    t.float    "co2_factor"
    t.float    "ch4_factor"
    t.float    "n2o_factor"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  add_index "co2_emission_factors", ["co2_source_id", "co2_scenario_id", "period"], :name => "ef_foreign_key_indx", :unique => true
  add_index "co2_emission_factors", ["id"], :name => "index_co2_emission_factors_on_id"

  create_table "co2_equivs", :force => true do |t|
    t.string   "name"
    t.float    "value"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "co2_equivs", ["id"], :name => "index_co2_equiv_on_id"
  add_index "co2_equivs", ["name"], :name => "index_co2_equiv_on_name", :unique => true

  create_table "co2_heat_mixes", :force => true do |t|
    t.integer  "co2_source_id"
    t.integer  "co2_scenario_id"
    t.integer  "period"
    t.float    "value"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  add_index "co2_heat_mixes", ["co2_source_id", "co2_scenario_id", "period"], :name => "heat_mix_foreign_key_index", :unique => true
  add_index "co2_heat_mixes", ["id"], :name => "index_co2_heat_mixes_on_id"

  create_table "co2_scenarios", :force => true do |t|
    t.integer  "city_id"
    t.integer  "base_year"
    t.integer  "time_step"
    t.string   "name"
    t.string   "description"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
    t.integer  "user_id",     :null => false
    t.text     "assumptions"
    t.text     "policies"
    t.text     "conclusion"
    t.text     "notes"
    t.integer  "last_editor", :null => false
  end

  add_index "co2_scenarios", ["id"], :name => "index_co2_scenarios_on_id"
  add_index "co2_scenarios", ["name", "city_id"], :name => "index_co2_scenarios_on_name_and_city_id", :unique => true

  create_table "co2_sector_scenarios", :force => true do |t|
    t.integer  "co2_sector_id"
    t.integer  "co2_scenario_id"
    t.float    "demand"
    t.float    "efficiency"
    t.float    "base_total"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
  end

  add_index "co2_sector_scenarios", ["co2_sector_id", "co2_scenario_id"], :name => "index_co2_sector_scenarios_on_co2_sector_id_and_co2_scenario_id", :unique => true
  add_index "co2_sector_scenarios", ["id"], :name => "index_co2_sector_scenarios_on_id"

  create_table "co2_sectors", :force => true do |t|
    t.string   "name"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
    t.integer  "site_details_id"
  end

  add_index "co2_sectors", ["id"], :name => "index_co2_sectors_on_id"
  add_index "co2_sectors", ["name"], :name => "index_co2_sectors_on_name", :unique => true

  create_table "co2_source_site_details", :force => true do |t|
    t.integer  "co2_source_id"
    t.integer  "site_detail_id"
    t.datetime "created_at",     :null => false
    t.datetime "updated_at",     :null => false
  end

  add_index "co2_source_site_details", ["co2_source_id", "site_detail_id"], :name => "co2_source_site_details_unq", :unique => true
  add_index "co2_source_site_details", ["id"], :name => "index_co2_source_site_details_on_id"

  create_table "co2_sources", :force => true do |t|
    t.string   "name"
    t.datetime "created_at",         :null => false
    t.datetime "updated_at",         :null => false
    t.boolean  "is_carrier"
    t.boolean  "electricity_source"
    t.boolean  "heat_source"
    t.boolean  "has_factor"
    t.float    "co2_factor"
    t.float    "ch4_factor"
    t.float    "n2o_factor"
    t.integer  "display_order"
  end

  add_index "co2_sources", ["id"], :name => "index_co2_sources_on_id"
  add_index "co2_sources", ["name"], :name => "index_co2_sources_on_name", :unique => true

  create_table "config_datasets", :force => true do |t|
    t.integer "dataset_id",       :null => false
    t.integer "mod_config_id",    :null => false
    t.text    "format"
    t.float   "bbox_left"
    t.float   "bbox_right"
    t.float   "bbox_top"
    t.float   "bbox_bottom"
    t.text    "crs"
    t.float   "res_x"
    t.float   "res_y"
    t.text    "input_identifier", :null => false
  end

  create_table "config_datasets", :force => true do |t|
    t.integer "dataset_id",       :null => false
    t.integer "mod_config_id",    :null => false
    t.text    "format"
    t.float   "bbox_left"
    t.float   "bbox_right"
    t.float   "bbox_top"
    t.float   "bbox_bottom"
    t.text    "crs"
    t.float   "res_x"
    t.float   "res_y"
    t.text    "input_identifier", :null => false
  end

  create_table "config_text_inputs", :force => true do |t|
    t.integer "mod_config_id", :null => false
    t.text    "identifier",    :null => false
    t.text    "value"
    t.boolean "is_input"
  end

  create_table "config_text_inputs", :force => true do |t|
    t.integer "mod_config_id", :null => false
    t.text    "identifier",    :null => false
    t.text    "value"
    t.boolean "is_input"
  end

  create_table "dataserver_bookmarks", :force => true do |t|
    t.integer "city_id"
    t.text    "url"
    t.integer "bookmark_type"
  end

  create_table "dataserver_urls", :force => true do |t|
    t.integer "city_id"
    t.text    "url"
    t.text    "descr"
  end

  create_table "dataservers", :force => true do |t|
    t.text     "url"
    t.text     "title"
    t.text     "abstract"
    t.datetime "last_seen"
    t.boolean  "alive"
    t.boolean  "wms"
    t.boolean  "wfs"
    t.boolean  "wcs"
  end

  create_table "dataservers", :force => true do |t|
    t.text     "url"
    t.text     "title"
    t.text     "abstract"
    t.datetime "last_seen"
    t.boolean  "alive"
    t.boolean  "wms"
    t.boolean  "wfs"
    t.boolean  "wcs"
  end

  create_table "dataset_folder_tags", :force => true do |t|
    t.integer "dataset_id"
    t.string  "folder_tag"
  end

  create_table "dataset_folder_tags", :force => true do |t|
    t.integer "dataset_id"
    t.string  "folder_tag"
  end

  create_table "dataset_tags", :force => true do |t|
    t.integer "dataset_id"
    t.text    "tag"
  end

  create_table "dataset_tags", :force => true do |t|
    t.integer "dataset_id"
    t.text    "tag"
  end

  create_table "datasets", :force => true do |t|
    t.string   "server_url",                         :null => false
    t.string   "identifier",                         :null => false
    t.integer  "city_id"
    t.boolean  "finalized",       :default => true,  :null => false
    t.datetime "created_at",                         :null => false
    t.datetime "updated_at",                         :null => false
    t.text     "service"
    t.boolean  "published",       :default => false
    t.text     "title"
    t.text     "abstract"
    t.datetime "last_seen"
    t.boolean  "alive"
    t.integer  "dataserver_id"
    t.text     "format"
    t.text     "bbox_left"
    t.text     "bbox_right"
    t.text     "bbox_top"
    t.text     "bbox_bottom"
    t.text     "resolution_x"
    t.text     "resolution_y"
    t.boolean  "local_srs"
    t.text     "bbox_srs"
    t.string   "style_attribute"
    t.float    "style_min"
    t.float    "style_max"
  end

  create_table "datasets", :force => true do |t|
    t.string   "server_url",                         :null => false
    t.string   "identifier",                         :null => false
    t.integer  "city_id"
    t.boolean  "finalized",       :default => true,  :null => false
    t.datetime "created_at",                         :null => false
    t.datetime "updated_at",                         :null => false
    t.text     "service"
    t.boolean  "published",       :default => false
    t.text     "title"
    t.text     "abstract"
    t.datetime "last_seen"
    t.boolean  "alive"
    t.integer  "dataserver_id"
    t.text     "format"
    t.text     "bbox_left"
    t.text     "bbox_right"
    t.text     "bbox_top"
    t.text     "bbox_bottom"
    t.text     "resolution_x"
    t.text     "resolution_y"
    t.boolean  "local_srs"
    t.text     "bbox_srs"
    t.string   "style_attribute"
    t.float    "style_min"
    t.float    "style_max"
  end

  create_table "geometry_columns", :id => false, :force => true do |t|
    t.string  "f_table_catalog",   :limit => 256, :null => false
    t.string  "f_table_schema",    :limit => 256, :null => false
    t.string  "f_table_name",      :limit => 256, :null => false
    t.string  "f_geometry_column", :limit => 256, :null => false
    t.integer "coord_dimension",                  :null => false
    t.integer "srid",                             :null => false
    t.string  "type",              :limit => 30,  :null => false
  end

  create_table "mod_configs", :force => true do |t|
    t.integer  "wps_server_id",                  :null => false
    t.text     "identifier"
    t.text     "name"
    t.text     "descr"
    t.datetime "created_at",                     :null => false
    t.datetime "updated_at",                     :null => false
    t.text     "status"
    t.datetime "run_started"
    t.datetime "run_ended"
    t.text     "pid"
    t.integer  "city_id"
    t.text     "status_text",    :default => ""
    t.integer  "wps_process_id"
    t.integer  "aoi",            :default => -1, :null => false
    t.integer  "run_status_id",  :default => 1,  :null => false
  end

  create_table "mod_configs", :force => true do |t|
    t.integer  "wps_server_id",                  :null => false
    t.text     "identifier"
    t.text     "name"
    t.text     "descr"
    t.datetime "created_at",                     :null => false
    t.datetime "updated_at",                     :null => false
    t.text     "status"
    t.datetime "run_started"
    t.datetime "run_ended"
    t.text     "pid"
    t.integer  "city_id"
    t.text     "status_text",    :default => ""
    t.integer  "wps_process_id"
    t.integer  "aoi",            :default => -1, :null => false
    t.integer  "run_status_id",  :default => 1,  :null => false
  end

  create_table "process_params", :force => true do |t|
    t.integer  "wps_process_id"
    t.text     "identifier"
    t.text     "title"
    t.text     "abstract"
    t.text     "datatype"
    t.boolean  "is_input"
    t.boolean  "alive"
    t.datetime "last_seen"
    t.integer  "min_occurs",     :default => 1, :null => false
    t.integer  "max_occurs",     :default => 1, :null => false
  end

  create_table "process_params", :force => true do |t|
    t.integer  "wps_process_id"
    t.text     "identifier"
    t.text     "title"
    t.text     "abstract"
    t.text     "datatype"
    t.boolean  "is_input"
    t.boolean  "alive"
    t.datetime "last_seen"
    t.integer  "min_occurs",     :default => 1, :null => false
    t.integer  "max_occurs",     :default => 1, :null => false
  end

  create_table "run_statuses", :force => true do |t|
    t.text "status"
    t.text "pretty_name"
  end

  create_table "run_statuses", :force => true do |t|
    t.text "status"
    t.text "pretty_name"
  end

  create_table "site_details", :force => true do |t|
    t.text    "stylesheet"
    t.string  "body_html_file"
    t.string  "footer_html_file"
    t.text    "meta_description"
    t.text    "meta_keywords"
    t.text    "top_banner_file"
    t.text    "tab_list"
    t.text    "additional_meta_tags"
    t.boolean "dss"
    t.text    "about_html_file"
    t.text    "legal_html_file"
  end

  create_table "site_details", :force => true do |t|
    t.text    "stylesheet"
    t.string  "body_html_file"
    t.string  "footer_html_file"
    t.text    "meta_description"
    t.text    "meta_keywords"
    t.text    "top_banner_file"
    t.text    "tab_list"
    t.text    "additional_meta_tags"
    t.boolean "dss"
    t.text    "about_html_file"
    t.text    "legal_html_file"
  end

  create_table "sites", :force => true do |t|
    t.text    "base_url"
    t.text    "title"
    t.integer "site_details_id", :null => false
  end

  create_table "sites", :force => true do |t|
    t.text    "base_url"
    t.text    "title"
    t.integer "site_details_id", :null => false
  end

  create_table "spatial_ref_sys", :id => false, :force => true do |t|
    t.integer "srid",                      :null => false
    t.string  "auth_name", :limit => 256
    t.integer "auth_srid"
    t.string  "srtext",    :limit => 2048
    t.string  "proj4text", :limit => 2048
  end

  create_table "styles", :force => true do |t|
    t.string   "max_colour"
    t.string   "min_colour"
    t.integer  "num_classes"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "ticket_follow_ups", :force => true do |t|
    t.string   "description", :null => false
    t.integer  "user_id",     :null => false
    t.integer  "ticket_id",   :null => false
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "ticket_statuses", :force => true do |t|
    t.string   "value",      :null => false
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "ticket_types", :force => true do |t|
    t.string   "value",      :null => false
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "tickets", :force => true do |t|
    t.string   "title",              :null => false
    t.text     "description",        :null => false
    t.integer  "ticket_type_id",     :null => false
    t.integer  "ticket_status_id",   :null => false
    t.integer  "user_id",            :null => false
    t.binary   "image"
    t.datetime "created_at",         :null => false
    t.datetime "updated_at",         :null => false
    t.string   "image_file_name"
    t.string   "image_content_type"
    t.integer  "image_file_size"
    t.datetime "image_updated_at"
  end

  create_table "users", :force => true do |t|
    t.string   "email",                  :default => "",    :null => false
    t.string   "encrypted_password",     :default => "",    :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.integer  "city_id"
    t.integer  "role_id",                :default => 1
    t.datetime "created_at",                                :null => false
    t.datetime "updated_at",                                :null => false
    t.string   "first_name"
    t.string   "last_name"
    t.string   "username"
    t.boolean  "approved",               :default => false, :null => false
    t.boolean  "is_admin",               :default => false, :null => false
  end

  add_index "users", ["approved"], :name => "index_users_on_approved"
  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

  create_table "users", :force => true do |t|
    t.string   "email",                  :default => "",    :null => false
    t.string   "encrypted_password",     :default => "",    :null => false
    t.string   "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.integer  "sign_in_count",          :default => 0
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string   "current_sign_in_ip"
    t.string   "last_sign_in_ip"
    t.integer  "city_id"
    t.integer  "role_id",                :default => 1
    t.datetime "created_at",                                :null => false
    t.datetime "updated_at",                                :null => false
    t.string   "first_name"
    t.string   "last_name"
    t.string   "username"
    t.boolean  "approved",               :default => false, :null => false
    t.boolean  "is_admin",               :default => false, :null => false
  end

  add_index "users", ["approved"], :name => "index_users_on_approved"
  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

  create_table "wps_processes", :force => true do |t|
    t.integer  "wps_server_id"
    t.text     "identifier"
    t.text     "title"
    t.text     "abstract"
    t.datetime "last_seen"
    t.boolean  "alive"
    t.integer  "city_id"
  end

  create_table "wps_processes", :force => true do |t|
    t.integer  "wps_server_id"
    t.text     "identifier"
    t.text     "title"
    t.text     "abstract"
    t.datetime "last_seen"
    t.boolean  "alive"
    t.integer  "city_id"
  end

  create_table "wps_servers", :force => true do |t|
    t.string   "url"
    t.text     "descr"
    t.datetime "created_at",    :null => false
    t.datetime "updated_at",    :null => false
    t.text     "title"
    t.text     "abstract"
    t.datetime "last_seen"
    t.boolean  "alive"
    t.text     "provider_name"
    t.text     "contact_name"
    t.text     "contact_email"
    t.integer  "city_id",       :null => false
  end

  create_table "wps_servers", :force => true do |t|
    t.string   "url"
    t.text     "descr"
    t.datetime "created_at",    :null => false
    t.datetime "updated_at",    :null => false
    t.text     "title"
    t.text     "abstract"
    t.datetime "last_seen"
    t.boolean  "alive"
    t.text     "provider_name"
    t.text     "contact_name"
    t.text     "contact_email"
    t.integer  "city_id",       :null => false
  end

end
