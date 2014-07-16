class Co2ScenariosController < ApplicationController
  before_filter :authenticate_user!
  before_filter {|t| t.set_active_tab("scenarios") }

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

    # Sources to use in Emission Factors
    @sources_factor = Co2Source.find_all_by_has_factor(true)
    # Sources to use in Electricity Mix
    @sources_elec = Co2Source.find_all_by_electricity_source(true)
    # Sources to use in Heat Mix
    @sources_heat = Co2Source.find_all_by_heat_source(true)
    # Sources to use in Consumption
    @sources_cons = Co2Source.find_all_by_is_carrier(true)
    
    @elec_id = Co2Source.find_by_name("Electricity").id;
    @heat_id = Co2Source.find_by_name("District Heating").id;
    
    @eq_ch4 = Co2Equiv.find_by_name("CH4").value;
    @eq_n20 = Co2Equiv.find_by_name("N2O").value;
    
    @city_id = User.getCurrentCity(current_user, cookies).id

    @sector_scenarios = []

    @sectors.each { |sector| 
      ss = Co2SectorScenario.new
      ss.co2_sector = sector

      @sector_scenarios.push(ss)
    }

    @periods = [0,1,2,3,4,5,6,7,8]
    @consumptions = Hash.new
    @elec_mixes = Hash.new
    @heat_mixes = Hash.new
    @emission_factors = Hash.new

    @periods.each { |period|
      @sources_cons.each { |source| 
        @sector_scenarios.each { |secscen|
          c = Co2Consumption.new
          c.period = period
          c.co2_source = source
          c.co2_sector_scenario = secscen

          default = Co2CityDefault.find_by_city_id_and_co2_sector_id_and_co2_source_id(
            @city_id,
            secscen.co2_sector.id,
            source.id)
          
          if default == nil
            c.value = 0.0
          else
            c.value = default.value
          end  
            
          @consumptions[[period, 
                         source.id, 
                         secscen.co2_sector.id]] = c
        }
      }
      
      # Mix array for Electricity
      @sources_elec.each { |s|
        m = Co2ElecMix.new
        m.period = period
        m.co2_source = s
        m.value = 0.0

        @elec_mixes[[period, s.id]] = m
      }
      
      # Mix array for Heat
      @sources_heat.each { |s|
        m = Co2HeatMix.new
        m.period = period
        m.co2_source = s
        m.value = 0.0

        @heat_mixes[[period, s.id]] = m
      }
      
      # Emission Factors
      @sources_factor.each { |s|
          ef = Co2EmissionFactor.new
          ef.co2_scenario_id = @scenario.id
          ef.co2_source_id = s.id
          ef.period = period
          ef.co2_factor = s.co2_factor
          ef.ch4_factor = s.ch4_factor
          ef.n2o_factor = s.n2o_factor

          @emission_factors[[period, s.id]] = ef
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

    params[:co2_sector_scenarios].each do |secscen|
      @sector_scenario = Co2SectorScenario.new(secscen[1])
      @sector_scenario.co2_scenario_id = @scenario.id
      @sector_scenario.save
    end

    periods = params[:co2_consumptions].size()
    
    # Sources to use in Consumption
    @sources_cons = Co2Source.find_all_by_is_carrier(true)
    # Sources to use in Electricity Mix
    @sources_elec = Co2Source.find_all_by_electricity_source(true)
    # Sources to use in Heat Mix
    @sources_heat = Co2Source.find_all_by_heat_source(true)
    # Sources to use in Emission Factors
    @sources_factor = Co2Source.find_all_by_has_factor(true)
    
    @elec_id = Co2Source.find_by_name("Electricity").id;
    @heat_id = Co2Source.find_by_name("District Heating").id;

    @eq_ch4 = Co2Equiv.find_by_name("CH4").value;
    @eq_n20 = Co2Equiv.find_by_name("N2O").value;

    (0..periods-1).each do |period| 
      @sources_cons.each do |s|
        params[:co2_consumptions][period.to_s][s.id.to_s].keys.each do |secscen_sector_id|
          secscen = Co2SectorScenario.find_by_co2_sector_id_and_co2_scenario_id(secscen_sector_id, @scenario.id)

          consumption = Co2Consumption.new
          consumption.period = period
          consumption.co2_source_id = s.id
          consumption.co2_sector_scenario_id = secscen.id
          consumption.value = params[:co2_consumptions][period.to_s][s.id.to_s][secscen_sector_id]
          consumption.save
        end
      end
    end

    (0..periods-1).each do |period| 
      @sources_elec.each do |s|
        mix = Co2ElecMix.new
        mix.period = period
        mix.co2_source_id = s.id
        mix.co2_scenario_id = @scenario.id
        mix.value = params[:co2_elec_mixes][period.to_s][s.id.to_s]
        mix.save
      end
    end
    
    (0..periods-1).each do |period| 
      @sources_heat.each do |s|
        mix = Co2HeatMix.new
        mix.period = period
        mix.co2_source_id = s.id
        mix.co2_scenario_id = @scenario.id
        mix.value = params[:co2_heat_mixes][period.to_s][s.id.to_s]
        mix.save
      end
    end

    (0..periods-1).each do |period| 
      @sources_factor.each do |source|
        ef = Co2EmissionFactor.new
        ef.co2_scenario_id = @scenario.id
        ef.co2_source_id = source.id
        ef.period = period
        ef.co2_factor = params[:co2_factor][period.to_s][source.id.to_s]
        ef.ch4_factor = params[:ch4_factor][period.to_s][source.id.to_s]
        ef.n2o_factor = params[:n2o_factor][period.to_s][source.id.to_s]
        ef.save
      end
    end


    redirect_to action: "index"
  end


  def edit
    @scenario = Co2Scenario.find(params[:id])
    @sectors = Co2Sector.all
    @sector_scenarios = Co2SectorScenario.find_all_by_co2_scenario_id(params[:id])
    @periods = []
    
    # Sources to use in Consumption
    @sources_cons = Co2Source.find_all_by_is_carrier(true)
    # Sources to use in Electricity Mix
    @sources_elec = Co2Source.find_all_by_electricity_source(true)
    # Sources to use in Heat Mix
    @sources_heat = Co2Source.find_all_by_heat_source(true)
    # Sources to use in Emission Factors
    @sources_factor = Co2Source.find_all_by_has_factor(true)
    
    @elec_id = Co2Source.find_by_name("Electricity").id;
    @heat_id = Co2Source.find_by_name("District Heating").id;
        
    @eq_ch4 = Co2Equiv.find_by_name("CH4").value;
    @eq_n20 = Co2Equiv.find_by_name("N2O").value;

    @consumptions = Hash.new
    @elec_mixes = Hash.new
    @heat_mixes = Hash.new
    @emission_factors = Hash.new

    # Pack these into a structure that is the same as we create in the new action above
    # If we do that, we can use the same UI code for editing as we do for creating
    max_period = 0
    Co2Consumption.includes(:co2_sector_scenario)
                  .where("co2_sector_scenarios.co2_scenario_id" => params[:id])
                  .each { |consumption|
                    @consumptions[[consumption.period, 
                                   consumption.co2_source_id, 
                                   consumption.co2_sector_scenario.co2_sector.id]] = consumption
                    if (max_period < consumption.period) 
                      max_period = consumption.period 
                    end
                  }

    (0..max_period-1).each do |n|
      @periods << n
    end

    Co2ElecMix.find_all_by_co2_scenario_id(params[:id])
          .each { |mix|
            @elec_mixes[[mix.period, mix.co2_source_id]] = mix
          }
          
    Co2HeatMix.find_all_by_co2_scenario_id(params[:id])
          .each { |mix|
            @heat_mixes[[mix.period, mix.co2_source_id]] = mix
          }

    Co2EmissionFactor.find_all_by_co2_scenario_id(params[:id])
      .each{ |ef| 
          @emission_factors[[ef.period, ef.co2_source_id]] = ef
        }


    # Render the form
    respond_to do |format|
      format.html
    end
  end


  def errorUpdating
    flash[:notice] = "Encountered a problem updating scenario" 
  end


  def getConsumption(scenario_id, sector_id, period, source_id)
    secscen = Co2SectorScenario.find_by_co2_sector_id_and_co2_scenario_id(sector_id, scenario_id)
    return Co2Consumption.find_by_period_and_co2_source_id_and_co2_sector_scenario_id(period, source_id, secscen.id)
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
    
    # Sources to use in Consumption
    @sources_cons = Co2Source.find_all_by_is_carrier(true)
    # Sources to use in Electricity Mix
    @sources_elec = Co2Source.find_all_by_electricity_source(true)
    # Sources to use in Heat Mix
    @sources_heat = Co2Source.find_all_by_heat_source(true)
    # Sources to use in Emission Factors
    @sources_factor = Co2Source.find_all_by_has_factor(true)
    
    @elec_id = Co2Source.find_by_name("Electricity").id;
    @heat_id = Co2Source.find_by_name("District Heating").id;
        
    @eq_ch4 = Co2Equiv.find_by_name("CH4").value;
    @eq_n20 = Co2Equiv.find_by_name("N2O").value;

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
    
    # Delete all consumptions with periods higher than the current number of periods in the scenario
    unusedConsumptions = Co2Consumption.includes(:co2_sector_scenario)
                                       .where("period > " + periods.to_s) 
                                       .where("co2_sector_scenarios.co2_scenario_id" => @scenario.id)

    unusedConsumptions.each do |u|
      binding.pry
      u.delete
    end
    
    # Update the remaining consumptions
    (0..periods-1).each do |p| 
      @sources_cons.each do |s|
        params[:co2_consumptions][p.to_s][s.id.to_s].keys.each do |secscen_sector_id|
          
          consumption = getConsumption(@scenario.id, secscen_sector_id, p, s.id)

          if not consumption 
            consumption = Co2Consumption.new
            consumption.period = p
            consumption.co2_source_id = s.id
            consumption.co2_sector_scenario_id = secscen_sector_id
          end

          consumption.value = params[:co2_consumptions][p.to_s][s.id.to_s][secscen_sector_id]

          if not consumption.save
            errorUpdating()
            return
          end
        end
      end
    end
    
    # Electricity -------------
    # Delete all mixes with periods higher than the current number of periods in the scenario
    unusedMixes = Co2ElecMix.includes(:co2_scenario)
                        .where("period > " + periods.to_s) 
                        .where("co2_scenario_id" => @scenario.id)

    unusedMixes.each do |u|
      u.delete
    end
    
    (0..periods-1).each do |p| 
      @sources_elec.each do |s|
        mix = Co2ElecMix.find_by_co2_scenario_id_and_period_and_co2_source_id(@scenario.id, p, s.id)

        if not mix 
          mix = Co2ElecMix.new
          mix.period = p
          mix.co2_source = s
          mix.co2_scenario_id = @scenario.id
        end

        mix.value = params[:co2_elec_mixes][p.to_s][s.id.to_s]

        if not mix.save
          errorUpdating()
          return
        end
      end
    end
    
    # Heat -------------
    unusedMixes = Co2HeatMix.includes(:co2_scenario)
                        .where("period > " + periods.to_s) 
                        .where("co2_scenario_id" => @scenario.id)

    unusedMixes.each do |u|
      u.delete
    end
    
    (0..periods-1).each do |p| 
      @sources_heat.each do |s|
        mix = Co2HeatMix.find_by_co2_scenario_id_and_period_and_co2_source_id(@scenario.id, p, s.id)

        if not mix 
          mix = Co2HeatMix.new
          mix.period = p
          mix.co2_source = s
          mix.co2_scenario_id = @scenario.id
        end

        mix.value = params[:co2_heat_mixes][p.to_s][s.id.to_s]

        if not mix.save
          errorUpdating()
          return
        end
      end
    end

    # Emission Factors -----------------
    # Delete all efs with periods higher than the current number of periods in the scenario
    unusedEFs = Co2EmissionFactor.where("period > " + periods.to_s)
                                 .where("co2_scenario_id" => @scenario.id)

    unusedEFs.each do |u|
      u.delete
    end


    (0..periods-1).each do |period| 
      @sources_factor.each do |source|
        ef = Co2EmissionFactor.find_by_co2_scenario_id_and_period_and_co2_source_id(@scenario.id, period, source.id)
        if not ef
          ef = Co2EmissionFactor.new
          ef.co2_scenario_id = @scenario.id
          ef.co2_source_id = source.id
          ef.period = period
        end

        ef.co2_factor = params[:co2_factor][period.to_s][source.id.to_s]
        ef.ch4_factor = params[:ch4_factor][period.to_s][source.id.to_s]
        ef.n2o_factor = params[:n2o_factor][period.to_s][source.id.to_s]

        if not ef.save
          errorUpdating()
          return
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
    
    @scenario = Co2Scenario.find(params[:id])
    @scenario.destroy
    
    redirect_to action: "index"
  end
end
