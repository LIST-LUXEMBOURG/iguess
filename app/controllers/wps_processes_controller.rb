class WpsProcessesController < ApplicationController

  # Returns a list of identifiers of registered processes for the specified url 
  # Will only be called via ajax
  def process_query
    @server = WpsServer.find_by_url(params["server_url"])
    @current_city  = User.getCurrentCity(current_user, cookies)

    if @server   
      @processes = @server.wps_processes.find_all_by_city_id(@current_city.id).map{|p| p.identifier }
    else
      @processes = []
    end

    render :json => { :success => true, :processes => @processes }
  end


  # Register a new WPS process -- will only be called with ajax
  def register
    # if not User.canAccessObject(current_user, @wps_server)
    #   showError("Insufficient permissions -- you cannot access this object!")
    #   return
    # end

    if not user_signed_in? then   # Should always be true
      return
    end

    # See if server is already in the database
    city_id = User.getCurrentCity(current_user, cookies).id
    server = WpsServer.find_by_url_and_city_id(params[:server_url], city_id)


    # If it doesn't exist, add it.  Note that we'll have one copy for each city.  This is lame,
    # but necessary to show the proper catalog entries when users are not logged in.
    if(!server)
      server = WpsServer.new
      server.url = params[:server_url]
    end

    server.city_id = city_id    # Before the update_attributes to avoid a null constraint violation
    server.update_attributes(params["server"])
    server.last_seen = DateTime.now
    server.alive = true
    
    server.save


    # Now add an entry to the process table
    process = WpsProcess.new

    process.update_attributes(params["process"])
    process.wps_server_id = server.id 
    process.last_seen = DateTime.now
    process.alive = true
    process.city_id = city_id
    process.save


    # Save process parameters in the database
    ProcessParam.createAll(params, process.id, true)
    ProcessParam.createAll(params, process.id, false)

    render :json => { :success => true, :message => "Process has been registered!" }
  end


  # Will only be called with ajax
  def unregister
    if not user_signed_in? then   # Should always be true
      return
    end

    server = WpsServer.find_by_url(params[:server_url])

    if not server then
      render :message => "No registered processes from this server!", :status => 403
      return
    end

    if not User.canAccessObject(current_user, server)
      showError("Insufficient permissions -- you cannot access this object!")
      return
    end


    city_id = User.getCurrentCity(current_user, cookies).id


    process = WpsProcess.find_by_wps_server_id_and_identifier_and_city_id(
                server.id, params[:proc_identifier], city_id)

    if process
      process.delete

      # :dependent => :destroy not doing what we want, so we'll do it manually
      params = ProcessParam.find_all_by_wps_process_id(process.id)      
      params.each {|p| p.delete }
    end

    # Mark server as "deleted" if there are no remaining processes associated with it
    processes = WpsProcess.find_by_wps_server_id_and_city_id(server.id, city_id)
    if not processes
      server.delete
    end

    render :json => { :success => true, :message => "Server has been unregistered!" }
  end


end
