class AboutController < ApplicationController
  before_filter {|t| t.set_active_tab("about") }
  
  def index
  end
end

