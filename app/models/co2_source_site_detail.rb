class Co2SourceSiteDetail < ActiveRecord::Base
  belongs_to :co2_source
  belongs_to :site_detail
end