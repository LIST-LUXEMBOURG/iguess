/**
 *  Copyright (C) 2010 - 2014 CRP Henri Tudor
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 * 
 * @author Luis de Sousa [luis.desousa@tudor.lu]
 * Date: 13-08-2014
 *
 * Methods to add and remove periods in the CO2 calculator.
 **/ 
 
var CO2 = CO2 || { };		// Create namespace

/***************************************************
 * This method is still missing the onChange event
 */
CO2.processNormalInput = function(input, inputName, newPeriod, sourceId)
{
	input.setAttribute("name", 
		inputName + "["  + 
		newPeriod + "][" + 
		sourceId  + "]"   );
};

CO2.processConsInput = function(input, inputName, newPeriod, sourceId)
{
	secscenId = input.name.split("[")[3].split("]")[0];
	input.setAttribute("name", 
	    inputName + "["  + 
		newPeriod + "][" + 
		sourceId  + "][" + 
		secscenId + "]"    );
};

CO2.addPeriodToTable = function(tableName, inputName, totals, newYear, newPeriod, processInput)
{
	var newRow = $("[id='" + tableName + "'] tr:last").clone();
	if(newRow.children()[0] == null) return;
	newRow.children()[0].firstChild.textContent = newYear;
	
	// First change all values to zero. Is this what the user is expecting?
	for(i = 1; i < newRow.children().length; i++)
		newRow.children()[i].children[0].value = "0.0";
		
	// Second change input ids, except for totals
	for(i = 1; i < newRow.children().length - totals; i++)
	{	
		var input = newRow.children()[i].children[0];
		sourceId = input.name.split("[")[2].split("]")[0];
		processInput(input, inputName, newPeriod, sourceId);
	}
	
	$("[id='" + tableName + "']").append(newRow);
};

CO2.addPeriod = function()
{
	newPeriod = $('#tableElecMix tr').length;
	baseYear  = $('#co2_scenario_base_year').val();
	timeStep  = $('#co2_scenario_time_step').val();
	newYear   = parseInt(baseYear) + timeStep * (newPeriod - 1);
	
	//Electricity Mix
	CO2.addPeriodToTable("tableElecMix", "co2_elec_mixes", 1,
		newYear, newPeriod, CO2.processNormalInput);
	//Heat Mix
	CO2.addPeriodToTable("tableHeatMix", "co2_heat_mixes", 1,
		newYear, newPeriod, CO2.processNormalInput);
	//Factors
	CO2.addPeriodToTable("table_co2_factor", "co2_factor", 0,
		newYear, newPeriod, CO2.processNormalInput);
	CO2.addPeriodToTable("table_ch4_factor", "ch4_factor", 0,
		newYear, newPeriod, CO2.processNormalInput);
	CO2.addPeriodToTable("table_n2o_factor", "n2o_factor", 0,
		newYear, newPeriod, CO2.processNormalInput);
	
	// Consumptions
	for (var sector in CO2.sector_demands)
		CO2.addPeriodToTable("tableCons" + sector, "co2_consumptions", 1, 
			newYear, newPeriod, CO2.processConsInput);
};

CO2.removePeriod = function()
{
	// Remove last row of a table
	$('#tableElecMix tr:last').remove();
	$('#tableHeatMix tr:last').remove();
	$('#table_co2_factor tr:last').remove();
	$('#table_ch4_factor tr:last').remove();
	$('#table_n20_factor tr:last').remove();
};
