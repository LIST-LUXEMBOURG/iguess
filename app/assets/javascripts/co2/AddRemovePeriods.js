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
CO2.addPeriodTable = function(tableName, inputName, newPeriod)
{
	var newRow = $('#' + tableName + ' tr:last').clone();
	newRow.children()[i].firstChild.innerHTML = newPeriod;
	for(i = 1; i < newRow.children.length; i++)
	{
		var input = newRow.children()[i].firstChild;
		input.setAttribute("value", "0.0");
		sourceId = input.name.split("[")[1].split("]")[0];
		input.setAttribute("name", inputName + "[" + newPeriod + "][" + sourceId + "]");
	}
};

CO2.addPeriod = function()
{
	numPeriods = $('#tableElecMix tr').length;
	baseYear   = $('co2_scenario[base_year]').val();
	timeStep   = $('co2_scenario[time_step]').val();
	newPeriod  = baseYear + timeStep * numPeriods;
	
	//Electricity Mix
	CO2.addPeriodTable("tableElecMix", "co2_elec_mixes", newPeriod);
	//Heat Mix
	CO2.addPeriodTable("tableHeatMix", "co2_heat_mixes", newPeriod);
	//Factors
	CO2.addPeriodTable("table_co2_factor", "co2_factor", newPeriod);
	CO2.addPeriodTable("table_ch4_factor", "ch4_factor", newPeriod);
	CO2.addPeriodTable("table_n2o_factor", "n2o_factor", newPeriod);
	
	// Consumptions
	//"tableCons" + sectorName
	

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
