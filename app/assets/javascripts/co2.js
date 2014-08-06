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

CO2.showMWh = false;

CO2.consPrefix = "tableCons";

CO2.sector_emissions = new Array();
CO2.sector_demands = new Array(); // MWh/a

CO2.sector_co2 = new Array(); // t/a
CO2.sector_ch4 = new Array(); // g/a
CO2.sector_n2o = new Array(); // g/a

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

CO2.calcSectorDemand = function(sector, input_growth, input_eff, input_demand)
{
	if (CO2.sector_demands[sector] == null)
		CO2.sector_demands[sector] = new Array();
	
	efficiency = parseFloat(document.getElementsByName(input_eff)[0].value) / 100;
	growth = parseFloat(document.getElementsByName(input_growth)[0].value) / 100;
	
	prior = parseFloat(document.getElementsByName(input_demand)[0].value);
	CO2.sector_demands[sector][0] = prior;
		
	for (p = 1; p < CO2.numPeriods; p++)
		CO2.sector_demands[sector][p] = prior * (1 + growth - efficiency);
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
		CO2.co2_emissions += CO2.calcFactor(input.value, CO2.co2_prefix, source, p);
		CO2.ch4_emissions += CO2.calcFactor(input.value, CO2.ch4_prefix, source, p);
		CO2.n2o_emissions += CO2.calcFactor(input.value, CO2.n2o_prefix, source, p);
	}
};

CO2.updateTotal = function(p, tot_name, table_name)
{
	id = tot_name;
	total_box = document.getElementById(id);
	total = 0.0;
	
	table = document.getElementById(table_name);
	row = table.rows[p + 1];
	for (i = 1; i < row.cells.length - 1; i++) 
		total += parseFloat(row.cells[i].children[0].value);

	total_box.value = total.toFixed(2);
	return total_box;
};

CO2.setTotalColourPercent = function(total_box)
{
	if(total_box.value >=0 && total_box.value <= 100) 
		total_box.className = "percent-green";
	else total_box.className = "percent-red";
};

CO2.updateElecTotals = function(p, tot_name, table_name)
{
	CO2.setTotalColourPercent(CO2.updateTotal(p, tot_name, table_name));
	CO2.calcComposedEmissions(table_name, p);
		
	CO2.co2_elec[p] = CO2.co2_emissions;
	CO2.ch4_elec[p] = CO2.ch4_emissions;
	CO2.n2o_elec[p] = CO2.n2o_emissions;
};

CO2.updateHeatTotals = function(p, tot_name, table_name)
{
	CO2.setTotalColourPercent(CO2.updateTotal(p, tot_name, table_name));
	CO2.calcComposedEmissions(table_name, p);
		
	CO2.co2_heat[p] = CO2.co2_emissions;
	CO2.ch4_heat[p] = CO2.ch4_emissions;
	CO2.n2o_heat[p] = CO2.n2o_emissions;
};

CO2.setTotalColourCons = function(total_box, p, sector)
{
	if(CO2.showMWh)
	{
		if(total_box.value >=0 && total_box.value <= CO2.sector_demands[sector][p])
			total_box.className = "percent-green";
		else total_box.className = "percent-red";
	}
	else CO2.setTotalColourPercent(total_box);
};

CO2.updateConsTotals = function(p, sector, tot_name, table_name)
{
	CO2.setTotalColourCons(CO2.updateTotal(p, tot_name, table_name), p, sector);
	CO2.calcSectorEmissions(p, sector, table_name);
};

CO2.calcSectorEmissions = function(p, sector, table_name)
{	
	table = document.getElementById(table_name);
	row = table.rows[p + 1];
	co2_emissions = 0.0;
	ch4_emissions = 0.0;
	n2o_emissions = 0.0;
	
	for(i = 1; i < row.cells.length - 1; i++) 
	{
		input = row.cells[i].children[0];
		name = input.name;
		first = name.indexOf("[") + 1;
		start = name.indexOf("[", first) + 1;
		end = name.indexOf("]", start);
		source = name.substring(start, end);
		if(source == CO2.elec_id)
		{
			co2_emissions += input.value * CO2.co2_elec[p];
			ch4_emissions += input.value * CO2.ch4_elec[p];
			n2o_emissions += input.value * CO2.n2o_elec[p];
		}
		else if(source == CO2.heat_id)
		{
			co2_emissions += input.value * CO2.co2_heat[p];
			ch4_emissions += input.value * CO2.ch4_heat[p];
			n2o_emissions += input.value * CO2.n2o_heat[p];
		}
		else
		{
			co2_emissions += CO2.calcFactor(input.value, CO2.co2_prefix, source, p);
			ch4_emissions += CO2.calcFactor(input.value, CO2.ch4_prefix, source, p);
			n2o_emissions += CO2.calcFactor(input.value, CO2.n2o_prefix, source, p);
		}
	}
	
	sector_demand = CO2.sector_demands[sector][p];
	CO2.sector_co2[CO2.sectorIndexes[sector]].data[p] = parseInt(co2_emissions * sector_demand);
	CO2.sector_ch4[CO2.sectorIndexes[sector]].data[p] = parseInt(ch4_emissions * sector_demand);
	CO2.sector_n2o[CO2.sectorIndexes[sector]].data[p] = parseInt(n2o_emissions * sector_demand);
};

CO2.updateEmissionsForPeriod = function(p)
{
	for (i = 0; i < CO2.sector_co2.length; i++)
		CO2.calcSectorEmissions(p, CO2.sector_co2[i].name,
			CO2.consPrefix + CO2.sector_co2[i].name);
}; 

CO2.toggleUnits = function()
{
	if(CO2.showMWh)
	{
		CO2.showMWh = false;
		document.getElementById("consump-title").innerHTML = "Energy Consumption per Sector (%)";
		document.getElementById("butt-units").innerHTML = "Toggle units to MWh";
	}
	else
	{
		CO2.showMWh = true;
		document.getElementById("consump-title").innerHTML = "Energy Consumption per Sector (MWh)";
		document.getElementById("butt-units").innerHTML = "Toggle units to %";
	}
		
	for (var sector in CO2.sector_demands)
	{
		table = document.getElementById(CO2.consPrefix + sector);
		for(p = 0; table != null && p < table.rows.length - 1; p++)
		{
			row = table.rows[p + 1];
			if(row == null) debugger;
			for(i = 1; i < row.cells.length; i++)
			{
				input = row.cells[i].children[0];
				if(CO2.showMWh)
					input.value = parseFloat(input.value) * CO2.sector_demands[sector][p] / 100.0;
				else
					input.value = (parseFloat(input.value) / CO2.sector_demands[sector][p] * 100.0).toFixed(1);
			}
		}
	}
	return false;
};



