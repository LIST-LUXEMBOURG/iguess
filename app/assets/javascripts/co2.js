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

CO2.updateTotal = function(p, s, size)
{
	id = "co2_cons_total_" + p + "_" + s;
	el = document.getElementById(id);
	total = 0.0;
	
	for(i = 1; i <= size; i++) 
	{
		name = "co2_consumptions[" + p + "][" + i + "][" + s + "]";
		total += parseFloat(document.getElementsByName(name)[0].value);
	}
	
	el.value = total;
};

CO2.updateMixTotal = function(p, size, tot_name, table_name)
{
	id = tot_name + p;
	el = document.getElementById(id);
	total = 0.0;
	
	table = document.getElementById(table_name);
	row = table.rows[p + 1];
	for(i = 1; i <= row.cells.length - 1; i++) 
		total += parseFloat(row.cells[i].children[0].value);

	el.value = total;
};

CO2.updateHeatMixTotal = function(p, size)
{
	CO2.updateMixTotal(p, size, "co2_heat_mix_total_", "tableHeatMix");
};

CO2.updateElecMixTotal = function(p, size)
{
	CO2.updateMixTotal(p, size, "co2_elec_mix_total_", "tableElecMix");
};
