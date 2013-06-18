class ModConfigsController < ApplicationController
  before_filter :authenticate_user!, :except => [:index]

  # GET /mod_configs
  # GET /mod_configs.json

  respond_to :html, :js

  def findAllTags()
    tags = []
    allInputs = ProcessParam.find_all_by_alive_and_is_input(:true, :true)
    allInputs.each { |i| tags.push(i.identifier) }

    return tags.sort.uniq
  end


  def index
    @current_city = current_user && current_user.role_id == 1 ? City.find_by_id(current_user.city_id) : (City.find_by_name(cookies['city']) or City.first)
    @mod_configs = ModConfig.find_all_by_city_id(@current_city.id)
    @wps_servers = WpsServer.find_all_by_alive(:true)
    # @tags = findAllTags()
    @wps_processes = WpsProcess.find_all_by_alive(:true, :order => 'title, identifier')
    # @wps_version = '1.0.0'

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @mod_configs }
    end
  end


  # GET /mod_configs/1
  # GET /mod_configs/1.json
  def show
    @mod_config      = ModConfig.find(params[:id])
    @current_city    = current_user.role_id == 1 ? City.find_by_id(current_user.city_id) : (City.find_by_name(cookies['city']) or City.first)
    @datasets        = Dataset.find_all_by_city_id(@current_city.id)
    @dataset_tags    = DatasetTag.all
    @datasetValues   = ConfigDataset.find_all_by_mod_config_id(params[:id]).map{|d| d.input_identifier + ': "' + d.dataset.id.to_s + '"'}.join(',')
    @formValues      = ConfigTextInput.find_all_by_mod_config_id(@mod_config).map{|text| text.column_name + (text.is_input ? 'input' : 'output') + ': "' + text.value + '"'}.join(',')
    # @dataserver_urls = @datasets.map{|d| d.server_url}.uniq
    @input_params    = @mod_config.wps_process.process_param.find_all_by_is_input_and_alive(true,  true)
    @output_params   = @mod_config.wps_process.process_param.find_all_by_is_input_and_alive(false,  true)

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @mod_config }
    end
  end


  # GET /mod_configs/new
  # GET /mod_configs/new.json
  def new
    @mod_config = ModConfig.new
    @wps_servers = WpsServer.find_all_by_alive(:true)
    @wps_processes = WpsProcess.find_all_by_alive(:true, :order => 'title, identifier')
    @datasets = Dataset.all
    @dataset_tags    = DatasetTag.all
    @current_city = current_user.role_id == 1 ? City.find_by_id(current_user.city_id) : (City.find_by_name(cookies['city']) or City.first)

    # @dataserver_urls = @datasets.map{|d| d.server_url}.uniq
    @textinputs = [ ]

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @mod_config }
    end
  end


  # GET /mod_configs/1/edit
  def edit
    @mod_config = ModConfig.find(params[:id])
  end


  # NOTE that this is not a definitve status -- we don't know, for example, which datasets are needed, and whether they
  # have been provided.  This really just detects that there are blank text items.  This function should probably be removed.
  def getStatus(mod_config)
    if(mod_config.status == nil || mod_config.status == 'READY' || mod_config.status == 'NEEDS_DATA')
      return 'READY'
    else
      return mod_config.status
    end
  end


  # Only called via ajax request... All we need to do is set status in the database to stop
  def stop_running
    @mod_config = ModConfig.find(params[:id])
    @mod_config.status = 'READY'
    @mod_config.save

    respond_with do |format|
      format.js { render :json => @mod_config, :status => :ok }
    end
  end


  # Only called via ajax request... need to fire up WPSClient and tell it to start
  # running the specified module
  def run
    @mod_config = ModConfig.find(params[:id])
    # @city = 

    wpsClientPath ='/home/iguess/iguess_test';

    require 'uri'

    inputFields  = []
    inputValues  = []
    outputFields = []
    outputTitles = []


# http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/RO_localOWS_test.map&
# SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&IDENTIFIER=ro_dsm_mini&
# FORMAT=image/tiff&BBOX=92213,436671.500,92348,436795.000&CRS=EPSG:28992&RESX=1&RESY=1

    # Drop downs -- always inputs
    @mod_config.datasets.map { |config_dataset| 

                                configDataset = ConfigDataset.find_by_mod_config_id_and_dataset_id(@mod_config.id, config_dataset.id)

                                params = ""

                                if(configDataset) then
                                  if(not configDataset.format.blank?) then params += "&FORMAT=" + configDataset.format end
                                  if(not configDataset.crs.blank?)    then params += "&CRS="    + configDataset.crs    end

                                  if(configDataset.bbox_left && configDataset.bbox_right && configDataset.bbox_top && configDataset.bbox_bottom) then 
                                    params += "&BBOX=" + configDataset.bbox_left.to_s()  + "," + configDataset.bbox_bottom.to_s() + "," +
                                                         configDataset.bbox_right.to_s() + "," + configDataset.bbox_top.to_s()
                                  end

                                  if(configDataset.res_x and configDataset.res_x > 0 and configDataset.res_y and configDataset.res_y > 0) then 
                                    params += "&RESX=" + configDataset.res_x.to_s()
                                    params += "&RESY=" + configDataset.res_y.to_s()
                                  end
                                end

                                request = (config_dataset.service == 'WCS') ? 'getCoverage' : 'getFeature'
                                noun    = (config_dataset.service == 'WCS') ? 'COVERAGE'    : 'TYPENAME'

                                dataname = config_dataset.server_url + (config_dataset.server_url.include?("?") == -1 ? "?" : "&") +
                                'SERVICE=' + config_dataset.service + params +
                                URI.escape('&VERSION=1.0.0&REQUEST=' + request + '&' + noun + '=' + config_dataset.identifier)

                               inputFields.push(configDataset.input_identifier)
                               inputValues.push(dataname) 
                              }


    # Text fields -- both inputs and outputs
    @mod_config.config_text_inputs.map { |d|  if d.is_input then 
                                                inputFields.push(d.column_name)
                                                inputValues.push(d.value)
                                              else
                                                outputFields.push(d.column_name)
                                                outputTitles.push(d.value)
                                              end
                                        }

    argUrl       = '--url="'        + @mod_config.wps_process.wps_server.url + '"'
    argProc      = '--procname="'   + @mod_config.wps_process.identifier + '"'

    argName      = '--names="[' + inputFields.map { |i| "'" + i.to_s + "'" }.join(",") + ']"' 
    argVals      = '--vals="['  + inputValues.map { |i| "'" + i.to_s + "'" }.join(",") + ']"' 

    argOuts      = '--outnames="['  + outputFields.map { |i| "'" + i.to_s + "'" }.join(",") + ']"'
    argOutTitles = '--titles="['    + outputTitles.map { |i| "'" + i.to_s + "'" }.join(",") + ']"'

    cmd = 'cd '+ wpsClientPath +'; /usr/bin/python wpsstart.py ' + argUrl + ' ' +
                                   argProc + ' ' + argName + ' ' + argVals + ' ' + argOuts + ' ' + argOutTitles

    require 'open3'

# binding.pry

    output, stat = Open3.capture2e(cmd)


    # Currently, WPSClient spews out lots of garbage.  We only want the last line.
    output =~ /^OK:(.*)$/
    pid = $1

    print "PID = " ,pid

    # Need some error checking here...
    @mod_config.status = 'RUNNING'
    @mod_config.pid = pid
    @mod_config.run_started = Time.now
    @mod_config.status_text = ''
    @mod_config.save


    @mod_config = ModConfig.find(params[:id])
    respond_with do |format|
      format.js { render :json => @mod_config, :status => :ok }
    end
  end


  # POST /mod_configs
  # POST /mod_configs.json
  def create
    @current_city = current_user.role_id == 1 ? City.find_by_id(current_user.city_id) : (City.find_by_name(cookies['city']) or City.first)
    @mod_config = ModConfig.new(params[:mod_config])

    @mod_config.name = @mod_config.name.strip

    if(@mod_config.name.empty?) then
      @mod_config.name = "Unnamed Configuration"
    end

    @mod_config.city = @current_city

    @mod_config.wps_process_id = params[:wps_process_id]

    success = true


    # Move on to save all the selected datasets
    if(params[:datasets]) then        # Not every module has input datasets
      params[:datasets].each do |d|
        identifier = d[0]
        id = d[1]
        if(identifier != "" && id != "-1") then
          confds = ConfigDataset.new()
          confds.input_identifier = identifier
          confds.mod_config = @mod_config
          confds.dataset = Dataset.find(id)
          
          success &= confds.save()
        end
      end
    end


    # Save any text inputs and outputs the user provided
    if(success) then
      paramkeys = ['input', 'output']
      paramkeys.each { |paramkey|
        if(params[paramkey]) then                 # Iterate over params['input'], params['output']
          params[paramkey].each_key do |key|
            if(success) then 
              textval = ConfigTextInput.new()
              textval.mod_config = @mod_config
              textval.column_name = key
              textval.value = params[paramkey][key]
              textval.is_input = (paramkey == 'input')

              success &= textval.save()
            end
          end
        end
      }
    end


    @mod_config.status = getStatus(@mod_config)

    success &= @mod_config.save

    respond_to do |format|
      if success
        format.html { redirect_to @mod_config, notice: 'Mod config was successfully created.' }
        format.json { render json: @mod_config, status: :created, location: @mod_config }
      else
        format.html { render action: "new" }
        format.json { render json: @mod_config.errors, status: :unprocessable_entity }
      end
    end
  end


  # PUT /mod_configs/1
  # PUT /mod_configs/1.json
  # We get here when a module name or description is updated, or when one of the inputs or outputs is changed.
  # Should always be via json, though, not by normal form submit.
  def update
    @mod_config = ModConfig.find(params[:id])

    ok = true

    if(params[:datasets]) then        # Not every module has input datasets

      @config_datasets = ConfigDataset.find_all_by_mod_config_id(@mod_config.id)
      @config_datasets.each { |cd| 
        ok == ok && cd.delete()
      }
    
      # params[:datasets] is a list of pairs of identifiers and dataset_ids, like this:
      # {"roof_training_area"=>"235", "building_footprints"=>"222", "dsm"=>"301"}
      params[:datasets].each do |d|
        identifier = d[0]
        id = d[1]

        # binding.pry

        if(not identifier.empty?) then
          if(id != "-1") then
            confds = ConfigDataset.new()
            dataset = Dataset.find(id)

            confds.mod_config = @mod_config
            confds.dataset    = dataset
            confds.input_identifier = identifier
            confds.format     = params["dformat"][identifier]
            confds.crs        = params["srs"]    [identifier]

            confds.bbox_left   = params["bbox-left"]  [identifier]
            confds.bbox_right  = params["bbox-right"] [identifier]
            confds.bbox_top    = params["bbox-top"]   [identifier]
            confds.bbox_bottom = params["bbox-bottom"][identifier]

            confds.res_x = params["res-x"][identifier]
            confds.res_y = params["res-y"][identifier]

            ok &= confds.save()
          end
        end
      end
    end


    # Update any text inputs/outputs.  Since we don't know the ids of the items, we'll need to do a little hunting

    paramkeys = [:input, :output]
    paramkeys.each do |paramkey|
      if(params[paramkey]) then                 # Iterate over params['input'], params['output']
        params[paramkey].each { |p| 

          name = p[0]
          val = p[1].strip    # strip off leading and trailing whitespace

          @output = ConfigTextInput.find_by_mod_config_id_and_column_name_and_is_input(@mod_config.id, name, paramkey == :input)

          @output.value = val;
          ok = ok && @output.save
        }
      end
    end


    #@mod_config.status = 'nil'  <== caused status to be reset when editing the description or title

    # @mod_config.status = getStatus(@mod_config)

    ok == ok && @mod_config.update_attributes(params[:mod_config])

    respond_to do |format|
      if ok
        format.html { redirect_to @mod_config, notice: 'Mod config was successfully updated.' }  # <== Used at all?
        # Next line is text not json because for some reason something wasn't working...  this should
        format.js   { render :json => @mod_config, :status => :ok }   # <== For handling ajax requests for form input changes
        format.json { render :json => @mod_config, :status => :ok }   # <== For best_in_place
      else
        format.html { render action: "edit" }   # Need to handle errors here
        format.js { render :json => @mod_config.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /mod_configs/1
  # DELETE /mod_configs/1.json
  def destroy
    @mod_config = ModConfig.find(params[:id])
    @mod_config.destroy

    respond_to do |format|
      format.html { redirect_to mod_configs_url }
      format.json { head :no_content }
    end
  end
end
