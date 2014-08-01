class LegalController < ApplicationController
  before_filter {|t| t.set_active_tab("legal") }
  
  def index
  end
end

