class WpsProcessesController < ApplicationController

  # Returns a list of identifiers of registered processes for the specified url 
  # Will only be called via ajax
  def process_query
    @server = WpsServer.find_by_url_and_city_id(params["server_url"], User.getCurrentCity(current_user, cookies).id)

    if @server   
      @processes = @server.wps_processes.map{ |p| p.identifier }
    else
      @processes = []
    end

    render :json => { :success => true, :processes => @processes }

  end
end
