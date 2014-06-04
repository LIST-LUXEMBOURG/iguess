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

    @carriers = Co2Carrier.all.sort_by{|c| c.name}

  
    @periods = [0,1,2]
    @consumptions = Hash.new

    @periods.each { |period|
      @carriers.each { |carrier| 
        @sector_scenarios.each { |secscen|
          c = Co2Consumption.new
          c.period = period
          c.co2_carrier = carrier
          c.co2_sector_scenario = secscen
          c.value = period * 100  + carrier.id * 10 + secscen.co2_sector.id

          @consumptions[[period,c.co2_carrier.id,secscen.co2_sector.id]] = c
        }
      }
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

    @current_city  = User.getCurrentCity(current_user, cookies)

    @scenario = Co2Scenario.new(params[:co2_scenario])
    @scenario.city_id = @current_city.id
    @scenario.save

    params["co2_sector_scenarios"].each do |secscen|
      @sector_scenario = Co2SectorScenario.new(secscen[1])
      @sector_scenario.co2_scenario_id = @scenario.id
      @sector_scenario.save
    end

    periods = params[:co2_consumptions].size()
    @carriers = Co2Carrier.all

    (0..periods-1).each do |p| 
      @carriers.each do |c|
        params[:co2_consumptions][p.to_s][c.id.to_s].keys.each do |secscen_sector_id|
          secscen = Co2SectorScenario.find_by_co2_sector_id_and_co2_scenario_id(
                secscen_sector_id.to_i, @scenario.id)

          consumption = Co2Consumption.new
          consumption.period = p
          consumption.co2_carrier_id = c.id
          consumption.co2_sector_scenario_id = secscen.id
          consumption.value = params[:co2_consumptions][p.to_s][c.id.to_s][secscen_sector_id]
          consumption.save
        end
      end
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
