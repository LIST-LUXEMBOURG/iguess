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
    @sources = Co2Source.all

    @sector_scenarios = []

    @sectors.each { |sector| 
      ss = Co2SectorScenario.new
      ss.co2_sector = sector

      @sector_scenarios.push(ss)
    }

    @carriers = Co2Carrier.all.sort_by{|c| c.name}

  
    @periods = [0,1,2]
    @consumptions = Hash.new
    @mixes = Hash.new

    @periods.each { |period|
      @carriers.each { |carrier| 
        @sector_scenarios.each { |secscen|
          c = Co2Consumption.new
          c.period = period
          c.co2_carrier = carrier
          c.co2_sector_scenario = secscen
          c.value = period * 100  + carrier.id * 10 + secscen.co2_sector.id

          @consumptions[[period, 
                         carrier.id, 
                         secscen.co2_sector.id]] = c
        }

        if carrier.has_mix 
          @sources.each { |source|
            m = Co2Mix.new
            m.period = period
            m.co2_carrier = carrier
            m.co2_source = source
            m.value = period * 100  + carrier.id * 10 + source.id

            @mixes[[period, 
                    carrier.id, 
                    source.id]] = m
          }
        end
      }
    }

    # Render the form
    respond_to do |format|
      format.html
    end
  end   

 
  def getConsumption(scenario_id, sector_id, period, carrier_id)
    secscen = Co2SectorScenario.find_by_co2_sector_id_and_co2_scenario_id(sector_id, scenario_id)
    return Co2Consumption.find_by_period_and_co2_carrier_id_and_co2_sector_scenario_id(period, carrier_id, secscen.id)
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

    params[:co2_sector_scenarios].each do |secscen|
      @sector_scenario = Co2SectorScenario.new(secscen[1])
      @sector_scenario.co2_scenario_id = @scenario.id
      @sector_scenario.save
    end

    periods = params[:co2_consumptions].size()
    @carriers = Co2Carrier.all

    (0..periods-1).each do |p| 
      @carriers.each do |c|
        params[:co2_consumptions][p.to_s][c.id.to_s].keys.each do |secscen_sector_id|
          secscen = Co2SectorScenario.find_by_co2_sector_id_and_co2_scenario_id(secscen_sector_id, @scenario.id)

          consumption = Co2Consumption.new
          consumption.period = p
          consumption.co2_carrier_id = c.id
          consumption.co2_sector_scenario_id = secscen.id
          consumption.value = params[:co2_consumptions][p.to_s][c.id.to_s][secscen_sector_id]
          consumption.save
        end
      end
    end

    @carriers = Co2Carrier.find_all_by_has_mix(true)
    @sources  = Co2Source.all

    (0..periods-1).each do |p| 
      @carriers.each do |c|
        @sources.each do |s|
          mix = Co2Mix.new
          mix.period = p
          mix.co2_carrier_id = c.id
          mix.co2_source_id = s.id
          mix.co2_scenario_id = @scenario.id
          mix.value = params[:co2_mixes][p.to_s][c.id.to_s][s.id.to_s]
          mix.save
        end
      end
    end


    redirect_to action: "index"
  end


  def edit
    @scenario = Co2Scenario.find(params[:id])

    @sectors = Co2Sector.all
    @sources = Co2Source.all

    @sector_scenarios = Co2SectorScenario.find_all_by_co2_scenario_id(params[:id])
    @carriers = Co2Carrier.all.sort_by{|c| c.name}

  
    @periods = [0,1,2]  #TODO -- this needs to be dynamic!!
    @consumptions = Hash.new
    @mixes = Hash.new


    # Pack these into a structure that is the same as we create in the new action above
    # If we do that, we can use the same UI code for editing as we do for creating
    Co2Consumption.includes(:co2_sector_scenario)
                  .where("co2_sector_scenarios.co2_scenario_id" => params[:id])
                  .each { |consumption|
                    @consumptions[[consumption.period, 
                                   consumption.co2_carrier_id, 
                                   consumption.co2_sector_scenario.co2_sector.id]] = consumption
                  }

    Co2Mix.find_all_by_co2_scenario_id(params[:id])
          .each { |mix|
            @mixes[[mix.period, 
                    mix.co2_carrier_id, 
                    mix.co2_source_id]] = mix
          }

    # Render the form
    respond_to do |format|
      format.html
    end
  end


  def errorUpdating
    flash[:notice] = "Encountered a problem updating scenario" 
  end


  # PUT /co2_scenarios/1
  # PUT /co2_scenarios/1.json
  def update

    # if not user_signed_in?
    #   respond_to do |format|
    #     format.json { render :text => "You must be logged in!", :status => 403 }
    #   end
    # end


    @current_city  = User.getCurrentCity(current_user, cookies)
    @scenario = Co2Scenario.find(params[:id])

    if not @scenario.update_attributes(params[:co2_scenario])
      errorUpdating()
      return
    end

    @scenario.save


    # Now cycle through the sector_scenarios -- these should all already exist; the user can't dynamically create more
    params[:co2_sector_scenarios].each do |secscen|
      attribs = secscen[1]    
      sector_scenario = Co2SectorScenario.find_by_co2_scenario_id_and_co2_sector_id(@scenario.id, attribs[:co2_sector_id])

      if not sector_scenario.update_attributes(attribs)
        errorUpdating()
        return
      end

      sector_scenario.save
    end


    # And now the Carriers -- these may not all exist if the user added more years... create any missing ones,
    # and delete any extras.
    periods = params[:co2_consumptions].size()
    @carriers = Co2Carrier.all


    # Delete all consumptions with periods higher than the current number of periods in the scenario
    unusedConsumptions = Co2Consumption.includes(:co2_sector_scenario)
                                       .where("period >= " + periods.to_s) 
                                       .where("co2_sector_scenarios.co2_scenario_id" => @scenario.id)

    unusedConsumptions.each do |u|
      u.delete
    end

    # Update the remaining consumptions
    (0..periods-1).each do |p| 
      @carriers.each do |c|
        params[:co2_consumptions][p.to_s][c.id.to_s].keys.each do |secscen_sector_id|
          
          consumption = getConsumption(@scenario.id, secscen_sector_id, p, c.id)

          if not consumption 
            consumption = Co2Consumption.new
            consumption.period = p
            consumption.co2_carrier_id = c.id
            consumption.co2_sector_scenario_id = secscen_sector_id
          end

          consumption.value = params[:co2_consumptions][p.to_s][c.id.to_s][secscen_sector_id]

          if not consumption.save
            errorUpdating()
            return
          end
        end
      end
    end


    # Finally, update the mixes -- again, the number of periods may have changed!
    @carriers = Co2Carrier.find_all_by_has_mix(true)
    @sources  = Co2Source.all

    # Delete all mixes with periods higher than the current number of periods in the scenario
    unusedMixes = Co2Mix.includes(:co2_sector_scenario)
                        .where("period >= " + periods.to_s) 
                        .where("co2_scenario_id" => @scenario.id)

    unusedMixes.each do |u|
      u.delete
    end

    (0..periods-1).each do |p| 
      @carriers.each do |c|
        @sources.each do |s|
          mix = Co2Mix.find_by_co2_scenario_id_and_period_and_co2_carrier_id_and_co2_source_id(@scenario.id, p, c.id, s.id)

          if not mix 
            mix = Co2Mix.new
            mix.period = p
            mix.co2_carrier = c
            mix.co2_source = s
          end

          mix.value = params[:co2_mixes][p.to_s][c.id.to_s][s.id.to_s]

          if not mix.save
            errorUpdating()
            return
          end
        end
      end
    end

    flash[:notice] = "Successfully updated scenario"  
    
    redirect_to action: "index"

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
