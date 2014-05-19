
class ApplicationController < ActionController::Base
  protect_from_forgery

  # http://stackoverflow.com/questions/711418/how-to-prevent-browser-page-caching-in-rails
  # Needed on registered datasets page because Firefox tries to be smart about the checkboxes
  # but just ends up screwing it up
  before_filter :set_cache_buster
  before_filter :set_template_vars


  def set_cache_buster
    response.headers["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "Fri, 01 Jan 1990 00:00:00 GMT"
  end


  # Set some universal variables we'll need to render almost every page on the site
  def set_template_vars
    @site = Site.find_by_base_url(request.host)
    @site_details = SiteDetail.find_by_id(@site.site_details_id)
  end

end
