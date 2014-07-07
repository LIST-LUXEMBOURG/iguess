class MapsController < ApplicationController
  before_filter {|t| t.set_active_tab("maps") }

  def index
    @cities = City.all

    @current_city = (City.find_by_name(cookies["city"]) or City.first)

    @datasets = Dataset.all
    
    @styles = Style.all

    @IncludeFooter = false

    # The following will create a transposed list of all the requirements of all our models.
    # The keys are module_requirements objects, and the values are an array of module_configurations where that 
    # key is used.

    @datasetsByRequirement = {}
    
    respond_to do |format|
      format.html # index.html.erb
    end
  end
  
end

