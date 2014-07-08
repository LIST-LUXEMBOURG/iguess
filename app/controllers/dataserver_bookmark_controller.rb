class DataserverBookmarkController < ApplicationController

  respond_to :html, :json, :js   # See http://railscasts.com/episodes/224-controllers-in-rails-3, c. min 7:00


  def create
    if not user_signed_in?
      return
    end

    url    = params[:url]
    cityId = params[:city_id]
    type   = params[:bookmark_type]

    # Confirm this is not a duplicate...
    b = DataserverBookmark.find_by_city_id_and_url_and_bookmark_type(cityId, url, type)
    if not b
      @dataserver_bookmark = DataserverBookmark.new
      @dataserver_bookmark.city_id       = cityId
      @dataserver_bookmark.url           = url
      @dataserver_bookmark.bookmark_type = type
      @dataserver_bookmark.save
    end

    respond_to do |format|
      format.json { render :json => [], :status => :ok }     # Send success signal
    end
  end


  def destroy
    if not user_signed_in?
      return
    end

    url    = params[:url]
    cityId = params[:city_id]
    type   = params[:bookmark_type]

    @dataserver_bookmark = DataserverBookmark.find_by_city_id_and_url_and_bookmark_type(cityId, url, type)

    # Just in case someone deletes a preset from under us... this will make things seem nicer
    if @dataserver_bookmark
      if not User.canAccessObject(current_user, @dataserver_bookmark)
        return
      end

      @dataserver_bookmark.destroy
    end

    respond_to do |format|
      format.json { render :json => [], :status => :ok }     # Send success signal
    end
  end
end  