class ModConfigsController < ApplicationController
  # GET /mod_configs
  # GET /mod_configs.json

  respond_to :html, :js


  def index
    @current_city = (City.find_by_name(cookies['city']) or City.first)
    @mod_configs = ModConfig.all
    @wps_servers = WpsServer.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @mod_configs }
    end
  end

  # GET /mod_configs/1
  # GET /mod_configs/1.json
  def show
    @mod_config = ModConfig.find(params[:id])
    @current_city = (City.find_by_name(cookies['city']) or City.first)
    @datasets = Dataset.find_all_by_city_id(@current_city.id)
    @dataset_inputs = ConfigDataset.find_all_by_mod_config_id(params[:id])
    @text_inputs = ConfigTextInput.find_all_by_mod_config_id(@mod_config)
    @dataserver_urls = @datasets.map{|d| d.server_url}.uniq

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @mod_config }
    end
  end

  # GET /mod_configs/new
  # GET /mod_configs/new.json
  def new
    @mod_config = ModConfig.new
    @wps_servers = WpsServer.all
    @datasets = Dataset.all
    @dataserver_urls = @datasets.map{|d| d.server_url}.uniq
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

    wpsClientPath ='/home/iguess/iguess_production';

    require 'uri'

    inputFields  = []
    inputValues  = []
    outputFields = []
    outputTitles = []


# http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/RO_localOWS_test.map&
# SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&IDENTIFIER=ro_dsm_mini&
# FORMAT=image/tiff&BBOX=92213,436671.500,92348,436795.000&CRS=EPSG:28992&RESX=1&RESY=1


    # Drop downs -- always inputs
    @mod_config.datasets.map { |d| 
                                    if(d.service == 'WCS') then
                                          format = "image/tiff"
                                          bbox = "92213,436671.500,92348,436795.000"
                                          crs = "EPSG:28992"
                                          resx = "1"
                                          resy = "1"

                                          params = "&FORMAT=" + format +
                                                   "&BBOX=" + bbox +
                                                   "&CRS=" + crs +
                                                   "&RESX=" + resx +
                                                   "&RESY=" + resy
                                    else
                                      params = ""
                                    end

                                    dataname = d.server_url + (d.server_url.include?("?") == -1 ? "?" : "&") +
                                    'SERVICE=' + d.service + params +
                                    URI.escape('&VERSION=1.0.0&REQUEST=getFeature&TYPENAME=' + d.identifier)

                                   inputFields.push(d.dataset_type)
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

    argUrl       = '--url="'        + @mod_config.wps_server.url + '"'
    argProc      = '--procname="'   + @mod_config.identifier + '"'

    argName      = '--names="[' + inputFields.map  { |i| "'" + i.to_s + "'" }.join(",") + ']"' 
    argVals      = '--vals="['  + inputValues.map  { |i| "'" + i.to_s + "'" }.join(",") + ']"' 

    argOuts      = '--outnames="['  + outputFields.map { |i| "'" + i.to_s + "'" }.join(",") + ']"'
    argOutTitles = '--titles="['    + outputTitles.map { |i| "'" + i.to_s + "'" }.join(",") + ']"'

    cmd = 'cd '+ wpsClientPath +'; /usr/bin/python wpsstart.py ' + argUrl + ' ' +
                                   argProc + ' ' + argName + ' ' + argVals + ' ' + argOuts + ' ' + argOutTitles

   
    require 'open3'
    output, stat = Open3.capture2e(cmd)

#logger.debug("running pyscript...")
#logger.debug(cmd)
#logger.debug(output)
#logger.flush

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
    @current_city = (City.find_by_name(cookies['city']) or City.first)
    @mod_config = ModConfig.new(params[:mod_config])

    @mod_config.name = @mod_config.name.strip

    if(@mod_config.name.empty?) then
      @mod_config.name = "Unnamed Configuration"
    end

    @mod_config.city = @current_city

    server = WpsServer.find_by_url(params[:wps_server_url])
    @mod_config.wps_server = server
    @mod_config.identifier = params[:identifier]

    success = true


    # Move on to save all the selected datasets
    if(params[:datasets]) then        # Not every module has input datasets
      params[:datasets].each do |d|
        name = d[0]
        id = d[1]
        if(not name.empty?) then
          if(id != "-1") then
            confds = ConfigDataset.new()
            dataset = Dataset.find(id)
            confds.mod_config = @mod_config
            confds.dataset    = dataset

            success &= confds.save()
          end
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
    

      params[:datasets].each do |d|
        name = d[0]
        id = d[1]
        if(not name.empty?) then
          if(id != "-1") then
            confds = ConfigDataset.new()
            dataset = Dataset.find(id)
            confds.mod_config = @mod_config
            confds.dataset    = dataset

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

    @mod_config.status = nil

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
        format.js { render json: @mod_config.errors, status: :unprocessable_entity }
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
