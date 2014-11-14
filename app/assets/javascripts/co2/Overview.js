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
 * Date: 12-11-2014
 *
 * Code for the CO2 calculator.
 **/ 

var CO2 = CO2 || { };		// Create namespace

CO2.goalYear = 0;
CO2.totalRenMWh = 0.0;
CO2.totalMWhEndPeriod = 0.0;

CO2.calcTotalAtPeriod = function(vector, period)
{
    var total = 0.0;
	for (sector = 0; sector < vector.length; sector++)
		total += vector[sector].data[period];
	return total;
};

CO2.calcTotalDeclineAtEndPeriod = function(vector)
{
	var base   = CO2.calcTotalAtPeriod(vector, 0);
	var target = CO2.calcTotalAtPeriod(vector, CO2.numPeriods - 1);
	
	return (target / base - 1) * 100;
};

CO2.calcTotalEquivAtPeriod = function(period)
{
	return CO2.calcTotalAtPeriod(CO2.sector_co2, period)
	     + CO2.calcTotalAtPeriod(CO2.sector_n2o, period) * CO2.eqN2O
	     + CO2.calcTotalAtPeriod(CO2.sector_ch4, period) * CO2.eqCH4;
};

CO2.calcTotalEquivDeclineAtEndPeriod = function()
{	
	var base   = CO2.calcTotalEquivAtPeriod(0);
	var target = CO2.calcTotalEquivAtPeriod(CO2.numPeriods - 1);
	
	return (target / base - 1) * 100;
};

CO2.addRenewableToTotal = function(sector, period, input, share)
{
	value = parseFloat(input.value);
	value = value * share / 100;
	if(!CO2.showMWh) 
		value = value / 100 * CO2.sector_demands[sector].data[period];
	CO2.totalRenMWh += value;
};

CO2.calcShareRenewablesInSource = function(period, tableName)
{
	var totalRen = 0.0;
	var table = document.getElementById(tableName);
	var row = table.rows[period + 1];	
		
	for(var i = 1; i < row.cells.length - 1; i++) 
		if(table.rows[0].cells[i].classList[0] == "center")
			totalRen += parseFloat(row.cells[i].children[0].value);
			
	return totalRen;
};

CO2.calcShareRenewablesAtPeriod = function(period)
{
	var total = 0.0;
	var totalRen = 0.0;
	for (sector = 0; sector < CO2.sector_demands.length; sector++)
	{
		var table = document.getElementById(CO2.consPrefix + CO2.sector_demands[sector].name);
		var row = table.rows[period + 1];	
		
		for(var i = 1; i < row.cells.length - 1; i++) 
		{
			// The style class applied indicates if the source is renewable or not
			if(table.rows[0].cells[i].classList[0] == "center")
			{
				CO2.addRenewableToTotal(sector, period, row.cells[i].children[0], 100);
			}
			// For Electricity the share of renewables in the mix must be calculated
			else if (CO2.getSourceId(row.cells[i].children[0]) == CO2.elec_id)
			{
				share = CO2.calcShareRenewablesInSource(period, "tableElecMix");
				CO2.addRenewableToTotal(sector, period, row.cells[i].children[0], share);
			}
			// For Heat the share of renewables in the mix must be calculated
			else if (CO2.getSourceId(row.cells[i].children[0]) == CO2.heat_id)
			{
				share = CO2.calcShareRenewablesInSource(period, "tableHeatMix");
				CO2.addRenewableToTotal(sector, period, row.cells[i].children[0], share);
			}
		}
	}
	return CO2.totalRenMWh / CO2.totalMWhEndPeriod * 100;
};

CO2.addThousandsSeparator = function(input) 
{
    var output = input;
    if (parseFloat(input)) 
    {
        input = new String(input); // so you can perform string operations
        var parts = input.split("."); // remove the decimal part
        parts[0] = parts[0].split("").reverse().join("").replace(/(\d{3})(?!$)/g, "$1 ").split("").reverse().join("");
        output = parts.join(".");
    }
    return output;
};
