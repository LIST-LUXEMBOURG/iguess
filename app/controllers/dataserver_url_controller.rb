class DataserverUrlController < ApplicationController

  respond_to :html, :json, :js   # See http://railscasts.com/episodes/224-controllers-in-rails-3, c. min 7:00


  # GET /datasets/new
  # GET /datasets/new.json
  def create
   url    = params[:url]
   cityId = params[:city][:id]

   binding.pry

   @dataserver_url = DataserverUrl.new
   @dataserver_url.city_id = cityId
   @dataserver_url.url     = url
   @dataserver_url.descr   = ''
   @dataserver_url.save


    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @dataserver_url }
    end
  end

end  