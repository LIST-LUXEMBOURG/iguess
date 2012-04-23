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
    
    @datasets = Dataset.all
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
  

  # GET /mods/1
  # GET /mods/1.json
  def show
    @configs = ModConfig.all
    @dataset = Dataset.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @dataset }
    end
  end


  # GET /mods/new
  # GET /mods/new.json
  def new
    @mod_parameters = ModuleRequirement.all
    @dataset = Dataset.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @dataset }
    end
  end


  def create
    @dataset = Dataset.new(params[:dataset])

    respond_to do |format|
      if @dataset.save
        format.html { redirect_to @dataset, notice: 'Data description was successfully created.' }
        format.json { render json: @dataset, status: :created, location: @dataset }
      else
        format.html { render action: "new" }
        format.json { render json: @dataset.errors, status: :unprocessable_entity }
      end
    end
  end

  # GET /datasets/1/edit
  def edit
    @dataset = Dataset.find(params[:id])
  end

  # PUT /datasets/1
  # PUT /datasets/1.json
  def update
    @dataset = Dataset.find(params[:id])

    respond_to do |format|
      if @dataset.update_attributes(params[:dataset])
        format.html { redirect_to @dataset, notice: 'Data description was successfully updated.' }
        format.json { head :ok }
      else
        format.html { render action: "edit" }
        format.json { render json: @dataset.errors, status: :unprocessable_entity }
      end
    end
  end
  
  # DELETE /datasets/1
  # DELETE /datasets/1.json
  def destroy
    @dataset = Dataset.find(params[:id])
    @dataset.destroy

    respond_to do |format|
      format.html { redirect_to datasets_url }
      format.json { head :ok }
    end
  end
end

