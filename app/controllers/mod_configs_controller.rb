class ModConfigsController < ApplicationController
  before_filter :authenticate_user!, :except => [:index]
  before_filter {|t| t.set_active_tab("modules") }

  # GET /mod_configs
  # GET /mod_configs.json

  respond_to :html, :js


  def index
    @current_city = User.getCurrentCity(current_user, cookies)
    @mod_configs  = ModConfig.find_all_by_city_id(@current_city.id)

    # Select the processes to show in the Module Catalog.  If you are logged in, you will see only modules
    # registered for your city.  If you are not logged in, you will see modules registered to all cities in your
    # instance (i.e. Lamilo or iGUESS).
    if user_signed_in?    # Get all servers associated with this city
      @wps_processes = WpsProcess.joins(:wps_server)
                                 .where('city_id' => @current_city.id, :alive => true)
                                 .order('title, identifier')   # For catalog

      @wps_servers   = WpsServer.find_all_by_city_id_and_alive(@current_city.id, true)

    else    # User not signed in -- get all servers for all cities attached to this instance

      @wps_processes = WpsProcess.joins(:wps_server, {:wps_server => :city})
                                 .where(:cities => {:site_details_id => @site_details.id })
                                 .where(:alive => true)
                                 .order('title, identifier')
                                 .uniq_by{|s| s.wps_server.url + s.identifier }

      # Make a list of the servers associated with the processes we selected.
      # Have to do this this way due to denormalization of wps_servers table.
      @wps_servers = @wps_processes.map{|p| p.wps_server }.uniq_by{|p| p.id }
    end                               

    respond_to do |format|
      format.html # index.html.erb
    end
  end


  def showError(msg)
    flash[:error] = msg

    respond_to do |format|
      format.html { redirect_to mod_configs_url }
    end
  end


  # GET /mod_configs/1
  # GET /mod_configs/1.json
  def show
    @mod_config = ModConfig.find(params[:id])

    @current_city = User.getCurrentCity(current_user, cookies)

    if @mod_config.city_id != @current_city.id 
      showError("Cannot view that module with the currently selected city.  Sorry!")
      return
    end

    if not User.canAccessObject(current_user, @mod_config)
      showError("Insufficient permissions -- you cannot access this object!")
      return
    end

    # current_user should always be set here
    @datasets        = Dataset.find_all_by_city_id(@current_city.id)
   
    # Protect against database corruption; if a dataset is deleted from the datasets table and not
    # removed from config_datasets, the if-then clause in the map statement will give protection
    @datasetValues   = ConfigDataset.find_all_by_mod_config_id(params[:id])
                                    .map{|d| if d.dataset then 
                                                d.input_identifier + ': "' + d.dataset.id.to_s + '"' 
                                            end }
                                    .join(',')


    # Note that some inputs have been known to begin with problematic chars like "-"                      
    @textInputValues = ConfigTextInput.find_all_by_mod_config_id(@mod_config)
                                      .map{|t| "'" + t.identifier + (t.is_input ? 'input' : 'output') + "'" + ': "' + t.value + '"' }
                                      .join(',')

    @input_params  = @mod_config.wps_process.process_params.find_all_by_is_input(true,  :order=>:title)
    @output_params = @mod_config.wps_process.process_params.find_all_by_is_input(false, :order=>:title)

    respond_to do |format|
      format.html # show.html.erb
    end
  end


  # GET /mod_configs/new
  # GET /mod_configs/new.json
  def new
    if not user_signed_in?    # Should always be true
      showError("Insufficient permissions -- you are not logged in!")
      return
    end

    # current_user should always be set here
    @current_city = User.getCurrentCity(current_user, cookies)

    @mod_config = ModConfig.new
    @wps_servers = WpsServer.find_all_by_alive(:true)

    @wps_processes = WpsProcess.joins(:wps_server)
                               .where('wps_servers.city_id' => @current_city.id, :alive => :true)
                               .order('title, identifier')   # For catalog
    @datasets = Dataset.all

    @textinputs = [ ]

    respond_to do |format|
      format.html
    end
  end


  ReadyCode     = RunStatus.find_by_status('READY').id
  NeedsDataCode = RunStatus.find_by_status('NEEDS_DATA').id
  ErrorCode     = RunStatus.find_by_status('ERROR').id
  RunningCode   = RunStatus.find_by_status('RUNNING').id

  # NOTE that this is not a definitve status -- we don't know, for example, which datasets are needed, and whether they
  # have been provided.  This really just detects that there are blank text items.  This function should probably be removed.
  def getStatus(mod_config)

    id = mod_config.id.to_s

    # This beast figures out if there are any missing inputs or outputs for the specified module.  Note that 
    # the most recent status of the module must be saved for this to work!
    sql = "
      WITH missing AS (
        SELECT COUNT(*) AS c 
        FROM iguess_dev.mod_configs AS mc 
        LEFT JOIN iguess_dev.process_params     AS pp  ON mc.wps_process_id = pp.wps_process_id
        LEFT JOIN iguess_dev.config_datasets    AS cd  ON pp.identifier = cd.input_identifier AND cd.mod_config_id = mc.id
        LEFT JOIN iguess_dev.config_text_inputs AS cti ON pp.identifier = cti.identifier AND cti.mod_config_id = mc.id
        WHERE mc.id = " + id + " AND pp.alive = TRUE AND pp.is_input = TRUE AND cd.dataset_id IS NULL AND (cti.value IS NULL OR cti.value = '')

        UNION

        SELECT count(*) AS c FROM iguess_dev.mod_configs AS mc 
        LEFT JOIN iguess_dev.process_params AS pp ON mc.wps_process_id = pp.wps_process_id
        LEFT JOIN iguess_dev.config_text_inputs AS cti ON pp.identifier = cti.identifier AND cti.mod_config_id = mc.id
        WHERE mc.id = " + id + " AND pp.alive = TRUE AND pp.is_input = false AND (cti.value IS NULL OR cti.value = '')
      ) 

      SELECT sum(c) FROM missing
    "

    connection = ActiveRecord::Base.connection
    connection.execute(sql) 

    results = ModConfig.find_by_sql sql
    errs = results[0]["sum"]

    return errs == "0" ? ReadyCode : NeedsDataCode
  end


  # Only called via ajax request... All we need to do is set status in the database to stop
  def stop_running
    @mod_config = ModConfig.find(params[:id])

    if not User.canAccessObject(current_user, @mod_config)
      return
    end

    @mod_config.status = ReadyCode
    @mod_config.save

    respond_with do |format|
      format.js { render :json => @mod_config.to_json(:include => :run_status), :status => :ok }
    end
  end



  # Build the cmd line that we need to launch wpsstart.py
  def assembleCommandLine(mod_config, inputs, outputFields, outputTitles)

    cmd = 'cd ' + Rails.root.to_s() + '; ' + PythonPath + ' wpsstart.py ' 
    cmd += '--url="'      + mod_config.wps_process.wps_server.url + '" ' 
    cmd += '--procname="' + mod_config.wps_process.identifier     + '" '
    cmd += '--inputs="['  + inputs.map { |i| i.to_s }.join(",")   + ']" '

    argOutputs = '--outputs="{'
    j = 0
    until j == outputFields.size
      if (j > 0) 
        argOutputs += ", "
      end
      argOutputs += "'" + outputFields[j] + "':'" + outputTitles[j] + "'"
      j += 1
    end
    argOutputs += '}"'


    cmd += argOutputs 

    return cmd
  end



  # Only called via ajax request... need to fire up WPSClient and tell it to start
  # running the specified module
  def run
    @mod_config = ModConfig.find(params[:id])
    
    if not User.canAccessObject(current_user, @mod_config)
      return
    end

    require 'uri'

    inputs       = []
    outputFields = []
    outputTitles = []

    @aoi = nil

    if @mod_config.aoi != -1 then
      @aoi = Dataset.find_by_id(@mod_config.aoi)
    end

    @current_city = User.getCurrentCity(current_user, cookies)


    # These identifiers are the ones that are still "active".  The database does not store parameters
    # that are not "alive", so this list will be current as of last harvester run.  To be clear, there
    # may be come values in config_text_inputs that are associated with @mod_config that are not currently
    # in use... we want those in case a wps parameter reappears in the future (peraps someone was doing 
    # maintenance, and temporarily removed a parameter; we don't want to corrupt all our configurations 
    # by deleting the user's selected inputs).
    activeParamIdentifiers = @mod_config.wps_process.process_params.map { |p| p.identifier }


    @mod_config.datasets.map { |dataset| 
      dataRequest = dataset.getRequest(@current_city.srs, @aoi)

      configDataset = ConfigDataset.find_by_mod_config_id_and_dataset_id(@mod_config.id, dataset.id) 

      inputs.push("('" + configDataset.input_identifier + "', '" + dataRequest + "')")
    }


    # Text fields -- both inputs and outputs; only use fields that are still active
    @mod_config.config_text_inputs.keep_if{ |c| activeParamIdentifiers.include?(c.identifier) }.map { |d|  
          if d.is_input then 
            inputs.push("('" + d.identifier + "', '" + d.value.gsub("&", "&amp;") + "')")
          else
            outputFields.push(d.identifier)
            outputTitles.push(d.value)
          end
    }

    # Assemble our command line
    cmd = assembleCommandLine(@mod_config, inputs, outputFields, outputTitles)


    print "=============================================\n"
    print cmd
    print "\n============================================="

    require 'open3'

    # Run the command
    output, stat = Open3.capture2e(cmd)


    # Currently, WPSClient spews out lots of garbage.  We only want the last line.
    output =~ /^OK:(.*)$/
    pid = $1

    if pid == nil then
      output =~ /^ERR:(.*)$/
      error = $1  #re.sub('\n', '<br>\n', $1)

      if error == nil then    # We could not run wpsstart... output IS the error message
        error = "WPSClient Configuration Error: " + output #re.sub('\n', '<br>\n', output)
      end

      # Show error to client
      @mod_config.run_status_id = ErrorCode
      @mod_config.pid = ''
      @mod_config.status_text = error

    else
      # Success! change status to running and all that
      @mod_config.run_status_id = RunningCode
      @mod_config.pid = pid
      
      @mod_config.status_text = ''
    end

    @mod_config.run_started = Time.now
    @mod_config.save

    respond_with do |format|
      format.js { render :json => @mod_config.to_json(:include => :run_status), :status => :ok }
    end
  end


  # POST /mod_configs
  # POST /mod_configs.json
  def create
    if not user_signed_in?    # Should always be true
      return
    end

    # current_user should always be set here
    @current_city = User.getCurrentCity(current_user, cookies)
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
        if(params['output']) then                 # Iterate over params['input'], params['output']
          params['output'].each_key do |key|
            if(success) then 
              textval = ConfigTextInput.new()
              textval.mod_config = @mod_config
              textval.identifier = key
              textval.value = params[paramkey][key]
              textval.is_input = false

              success &= textval.save()
            end
          end  
        end
        
        if(params['input']) then
          params['input'].each_key do |key|
            params['input'][key].each do |input|
              textval = ConfigTextInput.new()
              textval.mod_config = @mod_config
              textval.identifier = key
              textval.value = input[1]
              textval.is_input = true

              success &= textval.save()
            end
          end
        end  
      #}
    end

    success &= @mod_config.save

    @mod_config.run_status_id = getStatus(@mod_config)

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


  # Simply return the current modconfig, in json format
  def getupdate
    @mod_config = ModConfig.find(params[:id])

    if not User.canAccessObject(current_user, @mod_config)
      return
    end

    render :json => @mod_config.to_json(:include => :run_status), :status => :ok
  end


  def clearerror
    @mod_config = ModConfig.find(params[:id])

    if not User.canAccessObject(current_user, @mod_config)
      return
    end

    if @mod_config.run_status_id == ErrorCode then   
      @mod_config.run_status_id = ReadyCode           
      @mod_config.save
    end

    respond_with do |format|
      format.js { render :json => @mod_config.to_json(:include => :run_status), :status => :ok }
    end

  end


  # PUT /mod_configs/1
  # PUT /mod_configs/1.json
  # We get here when a module name or description is updated, or when one of the inputs or outputs is changed.
  # Should always be via json, though, not by normal form submit.
  def update

    @mod_config = ModConfig.find(params[:id])

    if not User.canAccessObject(current_user, @mod_config)
      return
    end

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
        
        if(not identifier.empty?) then
          if(id != "-1") then
            confds = ConfigDataset.new()
            dataset = Dataset.find_by_id(id)

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
        params[paramkey].each do |p| 

          identifier = p[0]
          val = p[1].strip    # strip off leading and trailing whitespace
          isInput = (paramkey == :input)

          @output = ConfigTextInput.find_by_mod_config_id_and_identifier_and_is_input(
                        @mod_config.id, identifier, isInput)

          # @output can be nil if the wps changed the identifiers it uses, or perhaps the user cleared
          # a form field, which can delete the related element in ConfigTextInput
          if not @output then
            @output = ConfigTextInput.new
            @output.mod_config = @mod_config
            @output.identifier = identifier
            @output.value = val
            @output.is_input = isInput
          else
            @output.value = val
          end
          ok = ok && @output.save
        end
      end
    end

    ok == ok && @mod_config.update_attributes(params[:mod_config])

    respond_to do |format|
      if ok
        format.html { redirect_to @mod_config, notice: 'Mod config was successfully updated.' }  # <== Used at all?
        # Next line is text not json because for some reason something wasn't working...  this should
        format.js   { render :json => @mod_config.to_json(:include => :run_status), :status => :ok }   # <== For handling ajax requests for form input changes
        format.json { render :json => @mod_config.to_json(:include => :run_status), :status => :ok }   # <== For best_in_place
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

    if User.canAccessObject(current_user, @mod_config)
      @mod_config.destroy
      respond_to do |format|
        format.html { redirect_to mod_configs_url }
      end
    else
      showError("Insufficient permissions -- you cannot access this object!")
    end
  end
end
