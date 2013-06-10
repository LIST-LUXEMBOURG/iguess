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

ActiveRecord::Schema.define(:version => 20130610144822) do

  create_table "cities", :force => true do |t|
    t.string   "name"
    t.string   "url"
    t.integer  "zoom"
    t.string   "srs"
    t.float    "minx"
    t.float    "miny"
    t.float    "maxx"
    t.float    "maxy"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
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
    t.text    "column_name",   :null => false
    t.text    "value"
    t.boolean "is_input"
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

  create_table "dataset_tags", :force => true do |t|
    t.integer "dataset_id"
    t.text    "tag"
  end

  create_table "datasets", :force => true do |t|
    t.string   "server_url",                       :null => false
    t.string   "identifier",                       :null => false
    t.string   "dataset_type"
    t.integer  "city_id"
    t.boolean  "finalized",     :default => true,  :null => false
    t.datetime "created_at",                       :null => false
    t.datetime "updated_at",                       :null => false
    t.text     "service"
    t.boolean  "published",     :default => false
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
    t.integer  "wps_server_id"
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
  end

  create_table "spatial_ref_sys", :id => false, :force => true do |t|
    t.integer "srid",                      :null => false
    t.string  "auth_name", :limit => 256
    t.integer "auth_srid"
    t.string  "srtext",    :limit => 2048
    t.string  "proj4text", :limit => 2048
  end

  create_table "users", :force => true do |t|
    t.string   "email",                  :default => "", :null => false
    t.string   "encrypted_password",     :default => "", :null => false
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
    t.datetime "created_at",                             :null => false
    t.datetime "updated_at",                             :null => false
    t.string   "first_name"
    t.string   "last_name"
    t.string   "username"
  end

  add_index "users", ["email"], :name => "index_users_on_email", :unique => true
  add_index "users", ["reset_password_token"], :name => "index_users_on_reset_password_token", :unique => true

  create_table "wps_processes", :force => true do |t|
    t.integer  "wps_server_id"
    t.text     "identifier"
    t.text     "title"
    t.text     "abstract"
    t.datetime "last_seen"
    t.boolean  "alive"
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
  end

end
