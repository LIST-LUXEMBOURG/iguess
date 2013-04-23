class Dataserver < ActiveRecord::Base
  has_many :datasets, :dependent => :destroy
  belongs_to :dataserver
end