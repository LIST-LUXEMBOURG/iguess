class Co2ScenariosController < ApplicationController
  before_filter :authenticate_user!

  respond_to :html, :json, :js   # See http://railscasts.com/episodes/224-controllers-in-rails-3, c. min 7:00

  # GET /co2_scenarios
  # GET /co2_scenarios.json
  def index
    @current_city  = User.getCurrentCity(current_user, cookies)
    @co2_scenarios = Co2Scenario.find_all_by_city_id(@current_city.id)

    respond_to do |format|
      format.html  # index.html.erb
    end
  end


  # GET /co2_scenarios/new
  # GET /co2_scenarios/new.json
  def new
    @scenario = Co2Scenario.new

    # Set some defaults
    @scenario.base_year = 2010
    @scenario.time_step = 5

    @sectors = Co2Sector.all

    @sector_scenarios = []

    @sectors.each { |sector| 
      ss = Co2SectorScenario.new
      ss.co2_sector = sector

      @sector_scenarios.push(ss)
    }

    @carriers = Co2Carrier.all

  
    @periods = [0,1,2]
    @consumptions = Hash.new

    p_ctr = 0
    @periods.each { |period|
      c_ctr = 0
      @carriers.each { |carrier| 
        s_ctr = 0
        @sector_scenarios.each { |secscen|
          c = Co2Consumption.new
          c.period = period
          c.co2_carrier = carrier
          c.co2_carrier_id = c_ctr
          c.co2_sector_scenario = secscen
          c.value = p_ctr * 100  + c_ctr * 10 + s_ctr

          @consumptions[[p_ctr,c_ctr,s_ctr]] = c

          s_ctr += 1
        }
        c_ctr += 1
      }
      p_ctr += 1
    }


    # Render the form
    respond_to do |format|
      format.html
    end
  end    



  def create
    if not user_signed_in?    # Should always be true... but if not, return error and bail
      respond_to do |format|
        format.json { render :text => "You must be logged in!", :status => 403 }
      end
    end

    binding.pry

    @current_city  = User.getCurrentCity(current_user, cookies)

    @scenario = Co2Scenario.new(params[:co2_scenario])
    @scenario.city_id = @current_city.id
    @scenario.save

    params["co2_sector_scenarios"].each do |secscen|
      @sector_scenario = Co2SectorScenario.new(secscen[1])
      @sector_scenario.co2_scenario_id = @scenario.id
      @sector_scenario.save
    end

    redirect_to action: "index"
  end



  # PUT /co2_scenarios/1
  # PUT /co2_scenarios/1.json
  def update
    if not user_signed_in?
      respond_to do |format|
        format.json { render :text => "You must be logged in!", :status => 403 }
      end
    end
  end


  # DELETE /co2_scenarios/1
  # DELETE /co2_scenarios/1.json
  def destroy
    if not user_signed_in?    # Should always be true... but if not, return error and bail
      respond_to do |format|
        format.json { render :text => "You must be logged in!", :status => 403 }
      end
    end
  end
end
