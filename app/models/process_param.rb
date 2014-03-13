class ProcessParam < ActiveRecord::Base
  belongs_to :process

  before_save { self.last_seen = DateTime.now }
end

