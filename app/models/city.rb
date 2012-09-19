class City < ActiveRecord::Base
  default_scope :order => "name"    # Retrieve cities sorted by name
  has_one :dataset
end
