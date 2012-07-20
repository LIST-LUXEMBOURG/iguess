class DatasetsController < ApplicationController
  # GET /datasets
  # GET /datasets.json
  def index
    @datasets = Dataset.all
    @wps_servers = WpsServer.all

    # Find all unique server urls in @datasets, ignoring any blank entries
    @server_urls = @datasets.reject{|d| d.status != 'OK' || d.server_url.blank?}.map{|d| d.server_url}.uniq
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @datasets }
    end
  end

  # GET /datasets/1
  # GET /datasets/1.json
  def show
    @dataset = Dataset.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @dataset }
    end
  end

  # GET /datasets/new
  # GET /datasets/new.json
  def new
    @dataset = Dataset.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @dataset }
    end
  end

  # GET /datasets/1/edit
  def edit
    @dataset = Dataset.find(params[:id])
  end

  # POST /datasets
  # POST /datasets.json
  def create
    @dataset = Dataset.new(params[:dataset])

    respond_to do |format|
      if @dataset.save
        format.html { redirect_to @dataset, notice: 'Dataset was successfully created.' }
        format.json { render json: @dataset, status: :created, location: @dataset }
      else
        format.html { render action: "new" }
        format.json { render json: @dataset.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /datasets/1
  # PUT /datasets/1.json
  def update
    # If we are changing the dataset type, we need to unlink it from any configurations it is part of


    if params[:id] == 'update_data_type' then
      @dataset = Dataset.find_by_identifier_and_server_url(params[:dataset][:identifier], params[:dataset][:server_url])
    else
      @dataset = Dataset.find(params[:id])
    end

    if params[:dataset] && @dataset.dataset_type != params[:dataset][:dataset_type]
      @dataset.config_datasets.each { |cd| cd.delete }
    end

    respond_to do |format|
      if @dataset.update_attributes(params[:dataset])
        format.html { redirect_to @dataset, notice: 'Dataset was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @dataset.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /datasets/1
  # DELETE /datasets/1.json
  def destroy
    if params[:id] == 'destroy_by_params' then
      @dataset = Dataset.find_by_identifier_and_server_url(params[:dataset][:identifier], params[:dataset][:server_url])
    else
      @dataset = Dataset.find(params[:id])
    end

    @dataset.destroy

    respond_to do |format|
      format.html { redirect_to datasets_url }
      format.json { head :no_content }
    end
  end


  def mass_import
    @datasets = Dataset.all
    @current_city = City.find_by_name(cookies[:city])

    if @current_city.nil?     # Should never happen, but just in case...
      @current_city = City.first
    end

    @wps_servers = WpsServer.all
    @cities = City.all
  end
end
