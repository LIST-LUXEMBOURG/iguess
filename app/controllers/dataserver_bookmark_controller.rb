class DataserverBookmarkController < ApplicationController

  respond_to :html, :json, :js   # See http://railscasts.com/episodes/224-controllers-in-rails-3, c. min 7:00


  # GET /datasets/new
  # GET /datasets/new.json
  def create

    if not user_signed_in?
      return
    end

    url    = params[:url]
    cityId = params[:city][:id]

    # Confirm this is not a duplicate...
    u = DataserverBookmark.find_by_city_id_and_url(cityId, url)
    if not u
      @dataserver_bookmark = DataserverBookmark.new
      @dataserver_bookmark.city_id = cityId
      @dataserver_bookmark.url     = url
      @dataserver_bookmark.save
    end

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @dataserver_bookmark }
    end
  end


  def destroy
    url    = params[:url]
    cityId = params[:city][:id]

    @dataserver_bookmark = DataserverBookmark.find_by_city_id_and_url(cityId, url)

    # Just in case someone deletes a preset from under us... this will make things seem nicer
    u = DataserverBookmark.find_by_city_id_and_url(cityId, url)
    if u
      if not User.canAccessObject(current_user, @dataserver_bookmark)
        return
      end

    
      @dataserver_bookmark.destroy
    end

    respond_to do |format|
      format.html 
      format.json { head :no_content }
    end
  end

end  