
class ApplicationController < ActionController::Base
  protect_from_forgery

  # http://stackoverflow.com/questions/711418/how-to-prevent-browser-page-caching-in-rails
  # Needed on registered datasets page because Firefox tries to be smart about the checkboxes
  # but just ends up screwing it up
  before_filter :set_cache_buster

  def set_cache_buster
    response.headers["Cache-Control"] = "no-cache, no-store, max-age=0, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "Fri, 01 Jan 1990 00:00:00 GMT"
  end


end
