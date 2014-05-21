
class Co2ScenarioController < ApplicationController
  before_filter :authenticate_user!, :except => [:get_for_city]

  respond_to :html, :json, :js   # See http://railscasts.com/episodes/224-controllers-in-rails-3, c. min 7:00

  # GET /datasets
  # GET /datasets.json
  def index
    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @datasets }
    end
  end



  # Called when user registers a dataset by clicking on the "Register" button;
  #    always called via ajax with json response type
  def create
    if not user_signed_in?    # Should always be true... but if not, return error and bail
      respond_to do |format|
        format.json { render :text => "You must be logged in!", :status => 403 }
      end
      return
    end
  end



  # PUT /datasets/1
  # PUT /datasets/1.json
  def update
    if not user_signed_in?
      respond_to do |format|
        format.json { render :text => "You must be logged in!", :status => 403 }
      end
      return
    end

  end


  # DELETE /datasets/1
  # DELETE /datasets/1.json
  def destroy
    if not user_signed_in?    # Should always be true... but if not, return error and bail
      respond_to do |format|
        format.json { render :text => "You must be logged in!", :status => 403 }
      end
      return
    end
  end

end
