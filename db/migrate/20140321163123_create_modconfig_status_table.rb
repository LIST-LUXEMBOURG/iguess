class CreateModconfigStatusTable < ActiveRecord::Migration
  def up
        create_table :mod_config_status do |t|
                t.text :status
                t.text :pretty_name
        end
  end

  def down
        drop_table :mod_config_status
  end

end
