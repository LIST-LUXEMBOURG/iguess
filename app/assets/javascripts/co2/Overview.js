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