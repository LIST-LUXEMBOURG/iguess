class Dataserver < ActiveRecord::Base
  has_many :datasets, :dependent => :destroy
  belongs_to :dataserver


  # Constructor
  def initialize(url, title, abstract)
		@url, @title, @abstract = url, title, abstract
  end

end