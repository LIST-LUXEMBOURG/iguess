
class DatasetsController < ApplicationController
  before_filter :authenticate_user!, :except => [:get_for_city_for_mapping]
  before_filter {|t| t.set_active_tab("datamanager") }

  respond_to :html, :json, :js   # See http://railscasts.com/episodes/224-controllers-in-rails-3, c. min 7:00

  # GET /datasets
  # GET /datasets.json
  def index
    # current_user should always be set here
    @current_city = User.getCurrentCity(current_user, cookies)
    @datasets     = Dataset.find_all_by_city_id(@current_city.id, 
                        :select => "*, case when title = '' or title is null then identifier else title end as sortcol", 
                        :order => :sortcol )
    @wps_servers  = WpsServer.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @datasets }
    end
  end


  # Get all datasets for the specified city; only retrieve datasets tagged with "Mapping"; only used by ajax queries
  def get_for_city_for_mapping
    @current_city = City.find_by_id(params[:cityId])

    showOnlyPublished = false
    if current_user == nil  
      showOnlyPublished = true    # User not logged in
    elsif current_user.role_id == 2 
      showOnlyPublished = false   # User has permissions to see all
    elsif current_user.city_id == @current_city.id 
      showOnlyPublished = false   # User is in own city
    else
      showOnlyPublished = true    # User is in foreign city
    end


    if showOnlyPublished   
      @datasets = Dataset.find_all_by_city_id_and_published_and_alive(@current_city.id, :true, :true, :order => 'title desc')
    else
      @datasets = Dataset.find_all_by_city_id_and_alive(@current_city.id, :true, :order => 'title desc')
    end

    # Get rid of all datasets that don't have the Mapping tag
    @datasets.keep_if {|d| d.dataset_tags.map{|t| t.tag}.include?("Mapping") }

    # I really want this, but it returns HTML... respond_with(@datasets)
    respond_to do |format|
      format.json { render json: @datasets.to_json(:include => {:dataset_tags => { :only => :tag }, 
                                                                :dataset_folder_tags => { :only => :folder_tag } 
                                                               } 
                                                  ) 
                  } 
    end
  end


  def check_user_login
    if not user_signed_in?    # Should always be true... but if not, return error and bail
      respond_to do |format|
        format.json { render :text => "You must be logged in!", :status => 403 }
      end

      return false
    end

      return true
  end


  # Called when user registers a dataset by clicking on the "Register" button;
  #    always called via ajax with json response type
  def create
    if not check_user_login
      return
    end


    @dataset = Dataset.new(params[:dataset])

    # Check if the dataset's server url is in our dataservers database... if not, add it
    url = @dataset.server_url.strip
    @dataserver = Dataserver.find_by_url(url)

    if not @dataserver 
      # Need to create a new server (create method creates and saves the object)
      @dataserver = Dataserver.new
      @dataserver.url      = url
      @dataserver.title    = params[:server_title]
      @dataserver.abstract = params[:server_abstract]

      @dataserver.save
    end

    @dataset.dataserver = @dataserver


    if @dataset.service == 'WFS'
      @current_city = City.find_by_id(params[:dataset][:city_id])
      @dataset.bbox_srs = @current_city.srs
    end


    @dataset.save

    if(params[:tags]) 
      tags = params[:tags].split(/,/)
      tags.each { |t| makeTag(@dataset, t) }
    end

    if(params[:folder_tags]) 
      tags = params[:folder_tags].split(/,/)
      tags.each { |t| makeFolderTag(@dataset, t) }
    end

    # Send the new dataset back to the client as a JSON object, along with any tags
    respond_to do |format|
      format.json { render :json => { :tags => DatasetTag.find_all_by_dataset_id(@dataset.id)
                                                         .map {|d| d.tag },
                                      :folder_tags => DatasetFolderTag.find_all_by_dataset_id(@dataset.id)
                                                         .map {|d| d.folder_tag },
                                      :dataset => @dataset
                                    }
                  }
    end
  end


   # Create a hook to return a datarequest for a particular dataset... primarily for testing purposes
   # http://0.0.0.0:3000/datasets/ShowDataRequest/1829
   # This should probably be deleted at some point, or at least require a key of some sort
  def ShowDataRequest
    dataset = Dataset.find_by_id(params[:id])
    if not dataset then
      respond_with do |format|
        format.html { render :text => "Could not find dataset with id = " + params[:id].to_s, 
                             :status => 404 }
      end
      return
    end

    req = dataset.getRequest(dataset.city.srs, nil)

    respond_with do |format|
      format.html { render :text => req, :status => :ok }
    end
  end


  # Returns a list of identifiers of registered datasets for the specified url 
  # Will only be called via ajax
  def dataset_query
    datasets = Dataset.find_all_by_server_url_and_city_id(params["server_url"], User.getCurrentCity(current_user, cookies).id)
    render :json => { :success => true, :datasets => buildRegisteredDataLayersJson(datasets) }
  end


  # PUT /datasets/1
  # PUT /datasets/1.json
  def update
    if not check_user_login
      return
    end

    if params[:dataset][:id]
      @dataset = Dataset.find_by_id(params[:dataset][:id])
    else
      @current_city = User.getCurrentCity(current_user, cookies)
      @dataset = Dataset.find_by_identifier_and_server_url_and_city_id(params[:dataset][:identifier], 
                                                                       params[:dataset][:server_url], 
                                                                       @current_city.id)
    end

    if(@dataset.nil?)   # Couldn't find dataset... now what?
      respond_to do |format|
        format.json { render :text => "Could not find dataset!", :status => 404 }
      end
      return
    end


    # User checked or unchecked publish checkbox (NOT the register dataset checkbox!!)
    if params[:id] == "publish"   
      if not User.canAccessObject(current_user, @dataset)
        respond_to do |format|
          format.json { render :text => "You don't have permissions for this object!", :status => 403 }
        end
        return
      end

      @dataset.published = params[:checked]
      @dataset.save

      respond_to do |format|
        # For some reason, we need to include a json body, otherwise, this gets interpreted by
        # the browser as an error message.
        format.json { render :json => [], :status => :ok }     # Send success signal
      end
    end
  end


  # DELETE /datasets/1
  # DELETE /datasets/1.json
  # Only called with json
  def destroy
    if not user_signed_in?    # Should always be true... but if not, return error and bail
      respond_to do |format|
        format.json { render :text => "You must be logged in!", :status => 403 }
      end
      return
    end
    
    if params[:id] == "destroy_by_params" then
      @dataset = Dataset.find_by_identifier_and_server_url(params[:dataset][:identifier], 
                                                           params[:dataset][:server_url])
    else
      @dataset = Dataset.find(params[:id])
    end

    status = :ok

    if @dataset and User.canAccessObject(current_user, @dataset)
      @dataset.destroy

      # Call a script to delete any locally stored datasets;
      # Run the command in a background process
      system PythonPath + " " + Rails.root.to_s() + "/deleteDataset.py " + 
          @dataset.server_url + " " + @dataset.identifier + " &"

    else
      status = 403
    end

    respond_to do |format|
      format.json { render :text => @dataset.id, :status => status }
      format.js   { render :text => @dataset.id, :status => status }
    end
  end


  def mass_import
    # current_user should always be set here
    @current_city = User.getCurrentCity(current_user, cookies)

    # Only used for generating a list of registered datasets
    @datasets = Dataset.find_all_by_city_id_and_finalized(@current_city.id, true)

    if @current_city.nil?     # Should never happen, but just in case...
      @current_city = City.first
    end

    @cities = City.all
  end


  # User is deleting a tag
  def del_tag
    if not check_user_login
      return
    end

    @current_city = User.getCurrentCity(current_user, cookies)
    @dataset = Dataset.find_by_identifier_and_server_url_and_city_id(params[:dataset][:identifier], 
                                                                 params[:dataset][:server_url], 
                                                                 @current_city.id)

    tagVal = params[:tag_val].strip    # Tag we are deleting

    if params[:tag_type] == "folder"   # Will be "proc" or "folder"
      tags = @dataset ? @dataset.dataset_folder_tags.find_all_by_folder_tag(tagVal) : nil
    else
      tags = @dataset ? @dataset.dataset_tags.find_all_by_tag(tagVal) : nil
    end

    if tags then
      tags.map {|t| t.delete }    # Handles tag in db more than once as result of bug elsewhere
    end

    returnTags = params[:tag_type] == "folder" ? @dataset.getFolderTagList() :
                                                 @dataset.getProcessingTagList()

    respond_to do |format|
      format.json { render :json => returnTags, :status => :ok }
    end                                                 
  end


  # Add a processing tag
  def add_data_tag
    if not check_user_login
      return
    end

    @current_city = User.getCurrentCity(current_user, cookies)
    @dataset = Dataset.find_by_identifier_and_server_url_and_city_id(params[:dataset][:identifier], 
                                                                 params[:dataset][:server_url], 
                                                                 @current_city.id)

    makeTag(@dataset, params[:tag_val].strip)

    respond_to do |format|
      format.json { render :json => @dataset.getProcessingTagList(), :status => :ok }
    end
  end


  # Add a folder tag
  def add_data_folder_tag
    if not check_user_login
      return
    end

    @current_city = User.getCurrentCity(current_user, cookies)
    @dataset = Dataset.find_by_identifier_and_server_url_and_city_id(params[:dataset][:identifier], 
                                                                 params[:dataset][:server_url], 
                                                                 @current_city.id)
    makeFolderTag(@dataset, params[:tag_val].strip)

    respond_to do |format|
      format.json { render :json => @dataset.getFolderTagList(), :status => :ok }
    end
  end


  # See if there are any datasets with this name already registered
  def check_name
    requested_name = params[:name]
    field_name = params[:field_name]

    @current_city = User.getCurrentCity(current_user, cookies)

    datasets = Dataset.find_all_by_title_and_city_id(requested_name, @current_city.id).length

    if datasets == 0
      status = 'ok' 
    else
      status = 'not ok'
    end

    available = '{"data": [{"fieldname": "' + field_name + '", "status": "' + status + '"} ] }'

    respond_to do |format|
      format.json { render :json => available, :status => :ok }
    end
  end


  # Find any tags that look like the passed value... called via ajax -- is this actually used anymore?

  # def find_matching_tags
  #   prefix = params[:prefix]
  #   field_name = params[:field_name]

  #   cityId = User.getCurrentCity(current_user, cookies).id

  #   knownTags = DatasetTag.select("distinct tag")
  #                         .joins(:dataset)
  #                         .merge(Dataset.where(:city_id => cityId))
  #                         .where("tag ilike :prefix", prefix: "#{prefix}%")
  #                         .map {|d| d.tag }

  #   if knownTags.blank? then
  #     taglist = '""'
  #   else
  #     taglist = '["' + knownTags.join('","') + '"]'
  #   end

    
  #   json = '{"data": [{"fieldname": "' + field_name + '", "matching_tags": ' + taglist + '} ] }'

  #   respond_to do |format|
  #     format.json { render :json => json, :status => :ok }
  #   end
  # end

end
