class ModConfigsController < ApplicationController
  # GET /mod_configs
  # GET /mod_configs.json
  def index
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

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @mod_config }
    end
  end

  # GET /mod_configs/1/edit
  def edit
    @mod_config = ModConfig.find(params[:id])
  end

  # POST /mod_configs
  # POST /mod_configs.json
  def create
    @mod_config = ModConfig.new(params[:mod_config])

    respond_to do |format|
      if @mod_config.save
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
  def update
    @mod_config = ModConfig.find(params[:id])

    respond_to do |format|
      if @mod_config.update_attributes(params[:mod_config])
        format.html { redirect_to @mod_config, notice: 'Mod config was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @mod_config.errors, status: :unprocessable_entity }
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
