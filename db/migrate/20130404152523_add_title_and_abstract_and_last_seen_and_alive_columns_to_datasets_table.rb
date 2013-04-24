class AddTitleAndAbstractAndLastSeenAndAliveColumnsToDatasetsTable < ActiveRecord::Migration
  def change
    add_column :datasets, :title, :text
    add_column :datasets, :abstract, :text
    add_column :datasets, :last_seen, :datetime
    add_column :datasets, :alive, :boolean
  end
end
