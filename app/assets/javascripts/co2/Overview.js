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

CO2.goalYear = 2025;

CO2.calcTotalAtYear = function(vector, year)
{
	var total = 0.0;
	factor = Math.floor((year - CO2.baseYear) / CO2.timeStep);
	factor_rest = (year - CO2.baseYear) % CO2.timeStep;
	
	for (sector = 0; sector < vector.length; sector++)
	{
		var base = vector[sector].data[factor];
		var end  = vector[sector].data[factor + 1];
		total += base + (end - base) * factor_rest;
	}
	return total;
};

CO2.calcTotalDeclineAtYear = function(vector)
{
	var base   = CO2.calcTotalAtYear(vector, CO2.baseYear);
	var target = CO2.calcTotalAtYear(vector, CO2.goalYear);
	
	return (target / base - 1) * 100;
};

CO2.calcTotalEquivAtYear = function(year)
{
	return CO2.calcTotalAtYear(CO2.sector_co2, year)
	     + CO2.calcTotalAtYear(CO2.sector_n2o, year) * CO2.eqN2O
	     + CO2.calcTotalAtYear(CO2.sector_ch4, year) * CO2.eqCH4;
};

CO2.calcTotalEquivDeclineAtYear = function()
{	
	var base   = CO2.calcTotalEquivAtYear(CO2.baseYear);
	var target = CO2.calcTotalEquivAtYear(CO2.goalYear);
	
	return (target / base - 1) * 100;
};