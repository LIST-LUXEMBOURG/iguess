class WpsServersController < ApplicationController
  # GET /wps_servers
  # GET /wps_servers.json
  def index
    @wps_servers = WpsServer.all

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
    @wps_server = WpsServer.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @wps_server }
    end
  end

  # GET /wps_servers/1/edit
  def edit
    @wps_server = WpsServer.find(params[:id])
  end

  # POST /wps_servers
  # POST /wps_servers.json
  def create
    @wps_server = WpsServer.new(params[:wps_server])

    respond_to do |format|
      if @wps_server.save
        format.html { redirect_to @wps_server, notice: 'Wps server was successfully created.' }
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

    respond_to do |format|
      if @wps_server.update_attributes(params[:wps_server])
        format.html { redirect_to @wps_server, notice: 'Wps server was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @wps_server.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /wps_servers/1
  # DELETE /wps_servers/1.json
  def destroy
    @wps_server = WpsServer.find(params[:id])
    @wps_server.destroy

    respond_to do |format|
      format.html { redirect_to wps_servers_url }
      format.json { head :no_content }
    end
  end
end
