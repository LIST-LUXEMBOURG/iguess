class ComparesController < ApplicationController

  def index
    @cities = City.all

    # @current_city = (City.find_by_id(cookies['city']) or City.first)
    @current_city = User.getCurrentCity(current_user, cookies)

    @datasets = Dataset.all
    
    # The following will create a transposed list of all the requirements of all our models.
    # The keys are module_requirements objects, and the values are an array of module_configurations where that 
    # key is used.

    @datasetsByRequirement = {}
    
    respond_to do |format|
      format.html # index.html.erb
    end
  end
  
end

