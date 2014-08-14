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

CO2.addPeriodToTable = function(tableName, inputName, newYear, newPeriod, processInput)
{
	var newRow = $('#' + tableName + ' tr:last').clone();
	//newRow.children()[0].firstChild.setAttribute("textContent", newYear);
	newRow.children()[0].firstChild.textContent = newYear;
	for(i = 1; i < newRow.children().length - 1; i++)
	{
		var input = newRow.children()[i].children[0];
		input.setAttribute("value", "0.0");
		sourceId = input.name.split("[")[2].split("]")[0];
		processInput(input, inputName, newPeriod, sourceId);
	}
	$('#' + tableName).append(newRow);
};

CO2.addPeriod = function()
{
	newPeriod = $('#tableElecMix tr').length;
	baseYear  = $('#co2_scenario_base_year').val();
	timeStep  = $('#co2_scenario_time_step').val();
	newYear   = parseInt(baseYear) + timeStep * (newPeriod - 1);
	
	//Electricity Mix
	CO2.addPeriodToTable("tableElecMix", "co2_elec_mixes", 
		newYear, newPeriod, CO2.processNormalInput);
	//Heat Mix
	CO2.addPeriodToTable("tableHeatMix", "co2_heat_mixes", 
		newYear, newPeriod, CO2.processNormalInput);
	//Factors
	CO2.addPeriodToTable("table_co2_factor", "co2_factor", 
		newYear, newPeriod, CO2.processNormalInput);
	CO2.addPeriodToTable("table_ch4_factor", "ch4_factor", 
		newYear, newPeriod, CO2.processNormalInput);
	CO2.addPeriodToTable("table_n2o_factor", "n2o_factor", 
		newYear, newPeriod, CO2.processNormalInput);
	
	return;
	
	// Consumptions
	for (var sector in CO2.sector_demands)
		CO2.addPeriodToTable("tableCons" + sector, "co2_consumptions", 
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
