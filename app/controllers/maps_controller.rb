class MapsController < ApplicationController


# 
  # def self.inherited(child)
    # child.instance_eval do
      # def index
        # @datasets = Dataset.all
# 
        # respond_to do |format|
          # format.html # index.html.erb
          # format.json { render json: @datasets }
        # end
      # end
    # end
    # super
  # end



  def index
    @cities = City.all

    @current_city = (City.find_by_name(cookies['city']) or City.first)

    @datasets = Dataset.all
    @dataserver_urls = @datasets.map{|d| d.server_url}.uniq

    @configs = ModConfig.all
    
    # The following will create a transposed list of all the requirements of all our models.
    # The keys are module_requirements objects, and the values are an array of module_configurations where that 
    # key is used.
    @requirements_by_config = {}  # Create empty hash
                                                      
    # @configs.collect{ |c| c.mod.module_requirements.collect{ |r| @requirements_by_config[r.parameter_type.name] ||= [];        # Create an empty array if needed
                                                                 # @requirements_by_config[r.parameter_type.name].push(c) } }    # Append config to the array

    @datasetsByRequirement = {}
    
    @datasets.collect{ |d|  @datasetsByRequirement[d.dataset_type] ||= [];     # Create an empty array if needed
                            @datasetsByRequirement[d.dataset_type].push(d)     # Append dataset to the array
                     }
    
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @datasets }
    end
  end
end

