class MapsController < ApplicationController

  def index
    @cities = City.all

    @current_city = (City.find_by_name(cookies['city']) or City.first)

    @datasets = Dataset.all
    @dataserver_urls = @datasets.map{|d| d.server_url}.uniq
    
    # The following will create a transposed list of all the requirements of all our models.
    # The keys are module_requirements objects, and the values are an array of module_configurations where that 
    # key is used.

    @datasetsByRequirement = {}
    
    respond_to do |format|
      format.html # index.html.erb
    end
  end
  
end

