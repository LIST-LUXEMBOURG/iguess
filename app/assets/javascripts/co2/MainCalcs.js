/**
 *  Copyright (C) 2010 - 2015 CRP Henri Tudor
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

// Flags indicating which untis to display (% or MWh)
CO2.showMWh = false;
CO2.showMWhProd = false;

// Stores the number of errors in the scenario, i.e. number of rows for which 
// the total is either under 0% or over 100%
CO2.errors = 0;
// CSS classes for totals boxes
CO2.corrtClass = "percent-green";
CO2.errorClass = "percent-red";

// Table names created by the rails code
CO2.consPrefix = "tableCons";
CO2.elecTableId = "tableElecMix";
CO2.heatTableId = "tableHeatMix";

// Demand values per sector and period. Built in calcSectorDemand.
CO2.sector_demands = new Array(); // MWh/a

// Emissions by sector, used to build the graphs.
CO2.sector_co2 = new Array(); // t/a
CO2.sector_ch4 = new Array(); // g/a
CO2.sector_n2o = new Array(); // g/a

// Intermidiate emissions for heat and electricity 
CO2.co2_elec = new Array(); // t/MWh
CO2.co2_heat = new Array(); // t/MWh
CO2.ch4_elec = new Array(); // t/MWh
CO2.ch4_heat = new Array(); // t/MWh
CO2.n2o_elec = new Array(); // t/MWh
CO2.n2o_heat = new Array(); // t/MWh

// Total electricity and heat generated at each period. 
// Used by the unit conversion buttons.
CO2.elecGen = new Array();
CO2.heatGen = new Array();

// Prefixes to the data inout boxes.
CO2.co2_prefix = "co2_factor";
CO2.ch4_prefix = "ch4_factor";
CO2.n2o_prefix = "n2o_factor";

// Variables storing temporary results
// In a normal world these would be protected properties...
CO2.co2_emissions = 0.0;
CO2.ch4_emissions = 0.0;
CO2.n2o_emissions = 0.0;

/**
 * Method: calcSectorDemand
 * Builds the sector_demands array, calculating demand values per sector and 
 * per period from demand table.
 */
CO2.calcSectorDemand = function(sector, input_growth, input_eff, input_demand)
{
	CO2.sector_demands[CO2.sectorIndexes[sector]].efficiency = 
		parseFloat(document.getElementsByName(input_eff)[0].value) / 100;
	CO2.sector_demands[CO2.sectorIndexes[sector]].growth = 
		parseFloat(document.getElementsByName(input_growth)[0].value) / 100;
	
	interest = CO2.sector_demands[CO2.sectorIndexes[sector]].growth - 
			   CO2.sector_demands[CO2.sectorIndexes[sector]].efficiency;
	
	CO2.sector_demands[CO2.sectorIndexes[sector]].data[0] = 
		parseFloat(document.getElementsByName(input_demand)[0].value);
		
	for (p = 1; p < CO2.numPeriods; p++)
		CO2.sector_demands[CO2.sectorIndexes[sector]].data[p] = 
			parseFloat((CO2.sector_demands[CO2.sectorIndexes[sector]].data[p- 1] * (1 + interest)).toFixed(1));
};

/**
 * Method: calcFactor
 * 
 * Returns:
 * Disaggregate value for a given source at a given period 
 * from a given aggregate total.
 */
CO2.calcFactor = function(value, prefix, source, p)
{
	factor_name = prefix + "[" + p + "][" + source + "]";
	factor = document.getElementsByName(factor_name)[0].value;
	return factor * value / 100; 
};

/**
 * Method: calcComposedEmissions
 * Computes total emessions for each substance at a given period.
 */
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

/**
 * Method: updateTotal
 * Computes total for a given period from the individual values of each sector.
 * 
 * Returns:
 * Input box containing the total for the period.
 */
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

/**
 * Method: setTotalColour
 * Sets the colour of a total box: green if correct, red otherwise.
 * Also updates number of errors in the Scenario.
 */
CO2.setTotalColour = function(condition, total_box)
{
	if(condition)
	{
		if(total_box.className == CO2.errorClass) CO2.errors--;
		total_box.className = CO2.corrtClass;
	}
	else		
	{
		if(total_box.className == CO2.corrtClass) CO2.errors++;
		total_box.className = CO2.errorClass;
	}
};

/**
 * Method: setTotalColourPercent
 * Determines if a percentage total is correct or not. 
 * Asks for a colour change accordingly.
 */
CO2.setTotalColourPercent = function(total_box)
{
	CO2.setTotalColour(total_box.value >=0 && total_box.value <= 100, total_box); 
};

/**
 * Method: updateElecTotals
 * Updates substance emissions from Electricity sources for a given period.
 */
CO2.updateElecTotals = function(p, tot_name, table_name)
{
	CO2.setTotalColourProd(CO2.updateTotal(p, tot_name, table_name), CO2.elecGen[p]);
	CO2.calcComposedEmissions(table_name, p);
		
	CO2.co2_elec[p] = CO2.co2_emissions;
	CO2.ch4_elec[p] = CO2.ch4_emissions;
	CO2.n2o_elec[p] = CO2.n2o_emissions;
};

/**
 * Method: updateElecTotals
 * Updates substance emissions from Heat sources for a given period.
 */
CO2.updateHeatTotals = function(p, tot_name, table_name)
{
	CO2.setTotalColourProd(CO2.updateTotal(p, tot_name, table_name), CO2.heatGen[p]);
	CO2.calcComposedEmissions(table_name, p);
		
	CO2.co2_heat[p] = CO2.co2_emissions;
	CO2.ch4_heat[p] = CO2.ch4_emissions;
	CO2.n2o_heat[p] = CO2.n2o_emissions;
};

/**
 * Method: setTotalColourCons
 * Determines if total consumption for a given period in a given sector 
 * is correct and updates the total box colour accordingly.
 */
CO2.setTotalColourCons = function(total_box, p, sector)
{
	if(CO2.showMWh)
		CO2.setTotalColour(
			total_box.value >=0 && total_box.value <= CO2.sector_demands[CO2.sectorIndexes[sector]].data[p],
			total_box);
	else 
		CO2.setTotalColourPercent(total_box);
};

/**
 * Method: setTotalColourProd
 * Determines if total energy production for a given period
 * is correct and updates the total box colour accordingly.
 */
CO2.setTotalColourProd = function(total_box, genPeriod)
{
	if(CO2.showMWhProd)
		CO2.setTotalColour(total_box.value >=0 && total_box.value <= genPeriod, total_box);
	else 
		CO2.setTotalColourPercent(total_box);
};

/**
 * Method: updateConsTotals
 * Computes total consumption for a given period in a given sector.
 * Calls for an update on the total box colour and recalculates emissions.
 */
CO2.updateConsTotals = function(p, sector, tot_name, table_name)
{
	CO2.setTotalColourCons(CO2.updateTotal(p, tot_name, table_name), p, sector);
	CO2.calcSectorEmissions(p, sector, table_name);
};

/**
 * Method: getSourceId
 *
 * Returns:
 * The id of an energy source from an HTML input box. 
 */
CO2.getSourceId = function(input)
{
	name = input.name;
	first = name.indexOf("[") + 1;
	start = name.indexOf("[", first) + 1;
	end = name.indexOf("]", start);
	return name.substring(start, end);
};

/**
 * Method: calcSectorEmissions
 * Computes total emissions for a given sector at a given period.
 * Results are stored in the sector_* arrays; secotr_demand is also updated. 
 */
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
		source = CO2.getSourceId(input);
		
		if(CO2.showMWh) 
			value = parseFloat(input.value) / 
			CO2.sector_demands[CO2.sectorIndexes[sector]].data[p] * 100.0;
		else 
			value = input.value;
		
		if(source == CO2.elec_id)
		{
			co2_emissions += value * CO2.co2_elec[p] / 100;
			ch4_emissions += value * CO2.ch4_elec[p] / 100;
			n2o_emissions += value * CO2.n2o_elec[p] / 100;
		}
		else if(source == CO2.heat_id)
		{
			co2_emissions += value * CO2.co2_heat[p] / 100;
			ch4_emissions += value * CO2.ch4_heat[p] / 100;
			n2o_emissions += value * CO2.n2o_heat[p] / 100;
		}
		else
		{
			co2_emissions += CO2.calcFactor(value, CO2.co2_prefix, source, p);
			ch4_emissions += CO2.calcFactor(value, CO2.ch4_prefix, source, p);
			n2o_emissions += CO2.calcFactor(value, CO2.n2o_prefix, source, p);
		}
	}
	
	sector_demand = CO2.sector_demands[CO2.sectorIndexes[sector]].data[p];
	CO2.sector_co2[CO2.sectorIndexes[sector]].data[p] = parseInt(co2_emissions * sector_demand);
	CO2.sector_ch4[CO2.sectorIndexes[sector]].data[p] = parseInt(ch4_emissions * sector_demand);
	CO2.sector_n2o[CO2.sectorIndexes[sector]].data[p] = parseInt(n2o_emissions * sector_demand);
};

/**
 * Method: updateEmissionsForPeriod
 * Triggers emissions calculations for all sectors at a given period. 
 */
CO2.updateEmissionsForPeriod = function(p)
{
	for (i = 0; i < CO2.sector_co2.length; i++)
		CO2.calcSectorEmissions(p, CO2.sector_co2[i].name,
			CO2.consPrefix + CO2.sector_co2[i].name);
}; 

// ------------- Toggle Consumption Units ------------- // 

/**
 * Method: toggleUnits
 * Iterates through the Consumption tables toggling units between % and MWh. 
 * Updates labels and buttons accordingly.
 */
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
		table = document.getElementById(CO2.consPrefix + CO2.sector_demands[sector].name);
		for(p = 0; table != null && p < table.rows.length - 1; p++)
		{
			row = table.rows[p + 1];
			for(i = 1; i < row.cells.length; i++)
			{
				input = row.cells[i].children[0];
				if(CO2.showMWh)
					input.value = (parseFloat(input.value) * 
						CO2.sector_demands[sector].data[p] / 100.0).toFixed(1);
				else
					input.value = (parseFloat(input.value) / 
						CO2.sector_demands[sector].data[p] * 100.0).toFixed(1);
			}
		}
	}
	return false;
};

// ------------- Toggle Generation Units ------------- // 

/**
 * Method: toggleUnitsProd
 * Triggers the computations that toggle Production units between % and MWh.
 * Triggers calculation of total production values if they have not been yet.
 * Updates labels and buttons accordingly.
 */
CO2.toggleUnitsProd = function()
{
	if(CO2.showMWhProd)
	{
		CO2.showMWhProd = false;
		document.getElementById("production-title").innerHTML = "Energy Production (%)";
		document.getElementById("butt-units-prod").innerHTML = "Toggle units to MWh";
	}
	else
	{
		CO2.showMWhProd = true;
		document.getElementById("production-title").innerHTML = "Energy Production (MWh)";
		document.getElementById("butt-units-prod").innerHTML = "Toggle units to %";
	}
		
	if (CO2.elecGen[0] == null)
		for (p = 0; p < CO2.numPeriods; p++) CO2.calcProdForPeriod(p);
	
	CO2.toggleUnitsProdSource(CO2.elecTableId, CO2.elecGen);
	CO2.toggleUnitsProdSource(CO2.heatTableId, CO2.heatGen);
};

/**
 * Method: calcProdForPeriod
 * Calculates total energy produced at a given period.
 * These totals are derived from sectorial consumptions and the percentages 
 * registered for electricity and heat sources in the period.
 * Stores results in CO2.elecGen and CO2.heatGen.
 */
CO2.calcProdForPeriod = function(period)
{
	// 1 - sums electricity consumption of all sectors in the period
	CO2.elecGen[period] = 0;
	CO2.heatGen[period] = 0;

	for (var sector in CO2.sector_demands)
	{
		table = document.getElementById(CO2.consPrefix + CO2.sector_demands[sector].name);
		if(table != null)
		{
			row = table.rows[period + 1];
			
			for(i = 1; i < row.cells.length; i++)
			{
				input = row.cells[i].children[0];
				source = CO2.getSourceId(input);
				value = parseFloat(input.value);
				
				if((value != null) && (!isNaN(value)))
				{
					if(source == CO2.elec_id)
					{
						// 2 - if in percentages multiplies by sector demand in the period
						if(CO2.showMWh)
							CO2.elecGen[period] += parseFloat(input.value);
						else
							CO2.elecGen[period] += parseFloat(input.value) * 
								CO2.sector_demands[sector].data[period] / 100.0;
					}
					else if(source == CO2.heat_id)
					{
						if(CO2.showMWh)
							CO2.heatGen[period] += parseFloat(input.value);
						else
							CO2.heatGen[period] += parseFloat(input.value) * 
								CO2.sector_demands[sector].data[period] / 100.0;
					}
				}
			}	
		}
	}
};

/**
 * Method: toggleUnits
 * Iterates through a given Production table toggling units between % and MWh. 
 * It requires an production totals array, e.g. CO2.elecGen or CO2.heatGen.
 */
CO2.toggleUnitsProdSource = function(tableId, prodArray)
{
	// 3 - multiplies each energy production component by total electricity consumption in the period. 
	table = document.getElementById(tableId);
 	for(p = 0; table != null && p < table.rows.length - 1; p++)
	{
		row = table.rows[p + 1];
		for(i = 1; i < row.cells.length; i++)
		{
			input = row.cells[i].children[0];
			if(CO2.showMWhProd)
				input.value = (parseFloat(input.value) * 
					prodArray[p] / 100.0).toFixed(1);
			else
				input.value = (parseFloat(input.value) / 
					prodArray[p] * 100.0).toFixed(1);
		}
	}
};

/**
 * Method: toggleUnits
 * Updates production totals arrays when a sectorial consumption is modified.
 */
CO2.updateProdTotals = function(p)
{
	CO2.calcProdForPeriod(p);
	
	if(CO2.showMWhProd)
	{
		CO2.updateProdTotalMWh(p, CO2.elecTableId, CO2.elecGen);
		CO2.updateProdTotalMWh(p, CO2.heatTableId, CO2.heatGen);
	}
};

/**
 * Method: toggleUnits
 * Updates production total in a given period for a given source.
 * Stores the result in a production totals array, e.g. CO2.elecGen or CO2.heatGen.
 */
CO2.updateProdTotalMWh = function(p, tableId, prodArray)
{
	table = document.getElementById(tableId);
	row = table.rows[p + 1];
	previousTotal = parseFloat(row.cells[row.cells.length - 1].children[0].value);
	
	for(i = 1; i < row.cells.length - 1; i++)
	{
		input = row.cells[i].children[0];
		input.value = (parseFloat(input.value) / previousTotal * prodArray[p]).toFixed(1);
	}
	
	row.cells[row.cells.length - 1].children[0].value = prodArray[p].toFixed(1);
};


