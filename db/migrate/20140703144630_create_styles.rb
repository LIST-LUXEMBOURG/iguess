class CreateStyles < ActiveRecord::Migration
  def change
    create_table :styles do |t|
      t.string :max_colour
      t.string :min_colour
      t.integer :num_classes
      t.timestamps
    end
  end

end
