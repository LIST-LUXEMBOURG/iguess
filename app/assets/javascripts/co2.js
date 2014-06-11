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
 * Date: 03-06-2014
 *
 * Code for the CO2 calculator.
 **/ 

var CO2 = CO2 || { };		// Create namespace

CO2.co2_elec = new Array(); // t/MWh
CO2.co2_heat = new Array(); // t/MWh
CO2.ch4_elec = new Array(); // t/MWh
CO2.ch4_heat = new Array(); // t/MWh
CO2.n2o_elec = new Array(); // t/MWh
CO2.n2o_heat = new Array(); // t/MWh

CO2.co2_prefix = "co2_factor";
CO2.ch4_prefix = "ch4_factor";
CO2.n2o_prefix = "n2o_factor";

// Variables storing temporary results
// In a normal world these would be protected properties...
CO2.co2_emissions = 0.0;
CO2.ch4_emissions = 0.0;
CO2.n2o_emissions = 0.0;

CO2.updateTotal = function(p, tot_name, table_name)
{
	id = tot_name;
	el = document.getElementById(id);
	total = 0.0;
	
	table = document.getElementById(table_name);
	row = table.rows[p + 1];
	for(i = 1; i < row.cells.length - 1; i++) 
		total += parseFloat(row.cells[i].children[0].value);

	el.value = total;
};

CO2.calcFactor = function(value, prefix, source, p)
{
	factor_name = prefix + "[" + p + "][" + source + "]";
	factor = document.getElementsByName(factor_name)[0].value;
	return factor * value / 100; 
};

CO2.calcComposedEmissions = function(table_name, p)
{
	table = document.getElementById(table_name);
	row = table.rows[p + 1];
	CO2.co2_emissions = 0.0;
	CO2.ch4_emissions = 0.0;
	CO2.n2o_emissions = 0.0;
	
	for(i = 1; i < row.cells.length - 1; i++) 
	{
		input = row.cells[i].children[0];
		name = input.name;
		source = name.substring(name.lastIndexOf("[") + 1, name.length - 1);
		co2_emissions += CO2.calcFactor(input.value, CO2.co2_prefix, source, p);
		ch4_emissions += CO2.calcFactor(input.value, CO2.ch4_prefix, source, p);
		n2o_emissions += CO2.calcFactor(input.value, CO2.n2o_prefix, source, p);
	}

};

CO2.updateElecTotals = function(p, tot_name, table_name)
{
	CO2.updateTotal(p, tot_name, table_name);
	CO2.calcComposedEmissions(table_name, p);
		
	CO2.co2_elec[p] = CO2.co2_emissions;
	CO2.ch4_elec[p] = CO2.ch4_emissions;
	CO2.n2o_elec[p] = CO2.n2o_emissions;
};

CO2.updateHeatTotals = function(p, tot_name, table_name)
{
	CO2.updateTotal(p, tot_name, table_name);
	CO2.calcComposedEmissions(table_name, p);
		
	CO2.co2_heat[p] = CO2.co2_emissions;
	CO2.ch4_heat[p] = CO2.ch4_emissions;
	CO2.n2o_heat[p] = CO2.n2o_emissions;
};

