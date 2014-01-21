class WpsServersController < ApplicationController
  # GET /wps_servers
  # GET /wps_servers.json
  def index
    @current_city  = User.getCurrentCity(current_user, cookies)
    @wps_servers   = WpsServer.find_all_by_city_id_and_deleted(@current_city.id, :false)

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @wps_servers }
    end
  end


  # GET /wps_servers/1
  # GET /wps_servers/1.json
  def show
    @wps_server = WpsServer.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @wps_server }
    end
  end


  # GET /wps_servers/new
  # GET /wps_servers/new.json
  def new
    if not user_signed_in?    # Should always be true
      showError("Insufficient permissions -- you are not logged in!")
      return
    end

    @current_city    = User.getCurrentCity(current_user, cookies)
    @wps_server = WpsServer.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @wps_server }
    end
  end

  # GET /wps_servers/1/edit
  def edit
    if not user_signed_in?    # Should always be true
      showError("Insufficient permissions -- you are not logged in!")
      return
    end

    @wps_server = WpsServer.find(params[:id])
  end


  # POST /wps_servers
  # POST /wps_servers.json
  def create
    if not user_signed_in?    # Should always be true
      showError("Insufficient permissions -- you are not logged in!")
      return
    end

    @wps_server = WpsServer.new(params[:wps_server])

    respond_to do |format|
      if @wps_server.save
        format.html { redirect_to @wps_server, notice: "WPS server was successfully created." }
        format.json { render json: @wps_server, status: :created, location: @wps_server }
      else
        format.html { render action: "new" }
        format.json { render json: @wps_server.errors, status: :unprocessable_entity }
      end
    end
  end


  # PUT /wps_servers/1
  # PUT /wps_servers/1.json
  def update
    @wps_server = WpsServer.find(params[:id])

    if not User.canAccessObject(current_user, @wps_server)
      showError("Insufficient permissions -- you cannot access this object!")
      return
    end

    respond_to do |format|
      if @wps_server.update_attributes(params[:wps_server]) then
        format.html { redirect_to @wps_server, notice: "WPS server was successfully updated." }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @wps_server.errors, status: :unprocessable_entity }
      end
    end
  end


  # Will only be called with json
  def register
    # if not User.canAccessObject(current_user, @wps_server)
    #   showError("Insufficient permissions -- you cannot access this object!")
    #   return
    # end

    if not user_signed_in? then   # Should always be true
      return
    end

    begin
      if WpsServer.addServer(params[:server_url], 
                             params[:server], 
                             params[:serverDetails]) then
        render :json => { :success => true, :message => "Server has been registered!" }
      end
    rescue => ex
      render :json => { :success => false, :status => 500, 
                        :message => "Error registering server:\n" + ex.message }
    end
  end


  # Will only be called with json
  def unregister
    # if not User.canAccessObject(current_user, @wps_server)
    #   showError("Insufficient permissions -- you cannot access this object!")
    #   return
    # end


    if not user_signed_in? then   # Should always be true
      return
    end


    @wps_server = WpsServer.find_by_url(params[:server_url])

    if not @wps_server then
      render :message => "Server is not registered!", :status => 403
      return
    end

    @wps_server.deleted = true
    @wps_server.save

    render :json => { :success => true, :message => "Server has been unregistered!" }
  end


  # DELETE /wps_servers/1
  # DELETE /wps_servers/1.json
  def destroy
    @wps_server = WpsServer.find(params[:id])

    if not User.canAccessObject(current_user, @wps_server)
      showError("Insufficient permissions -- you cannot access this object!")
      return
    end
    
    @wps_server.deleted = true
    @wps_server.save

    respond_to do |format|
      format.html { redirect_to wps_servers_url }
      format.json { head :no_content }
    end
  end
end
