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
 * Charts for the CO2 calculator.
 **/ 

var CO2 = CO2 || { };		// Create namespace

CO2.periodNames = new Array();
CO2.sectorIndexes = new Array();
CO2.lastIndex = 0;

        
CO2.addToSectorArrays = function(sector)
{
	CO2.sectorIndexes[sector] = CO2.lastIndex++;
	
	CO2.sector_co2.push({name: sector, data: new Array()});
	CO2.sector_ch4.push({name: sector, data: new Array()});
	CO2.sector_n2o.push({name: sector, data: new Array()});
};

CO2.updatePeriodNames = function()
{
	base_year = parseInt(document.getElementById("co2_scenario_base_year").value);
	time_step = parseInt(document.getElementById("co2_scenario_time_step").value);
	CO2.periodNames[0] = base_year.toString();
	for (i = 1; i < CO2.numPeriods; i++)
		CO2.periodNames[i] = (base_year + i * time_step).toString();
};

CO2.drawCharts = function()
{
	CO2.chartCO2();
	CO2.chartCH4();
	CO2.chartN2O();
};

CO2.chartCO2 = function () 
{
    $('#co2_chart').highcharts({
        chart: {
            type: 'area'
        },
        title: {
            text: 'C02 Emissions by Sector'
        },
        xAxis: {
            categories: CO2.periodNames,
            tickmarkPlacement: 'on',
            title: {
                enabled: false
            }
        },
        yAxis: {
            title: {
                text: 'ton/year'
            },
        },
        tooltip: {
            shared: true,
            valueSuffix: ' ton/year'
        },
        plotOptions: {
            area: {
                stacking: 'normal',
                lineColor: '#666666',
                lineWidth: 1,
                marker: {
                    lineWidth: 1,
                    lineColor: '#666666'
                }
            }
        },
        series: CO2.sector_co2
    });
};

CO2.chartCH4 = function () 
{
    $('#ch4_chart').highcharts({
        chart: {
            type: 'area'
        },
        title: {
            text: 'CH4 Emissions by Sector'
        },
        xAxis: {
            categories: CO2.periodNames,
            tickmarkPlacement: 'on',
            title: {
                enabled: false
            }
        },
        yAxis: {
            title: {
                text: 'g/year'
            },
        },
        tooltip: {
            shared: true,
            valueSuffix: ' g/year'
        },
        plotOptions: {
            area: {
                stacking: 'normal',
                lineColor: '#666666',
                lineWidth: 1,
                marker: {
                    lineWidth: 1,
                    lineColor: '#666666'
                }
            }
        },
        series: CO2.sector_ch4
    });
};

CO2.chartN2O = function () 
{
    $('#n2o_chart').highcharts({
        chart: {
            type: 'area'
        },
        title: {
            text: 'N2O Emissions by Sector'
        },
        xAxis: {
            categories: CO2.periodNames,
            tickmarkPlacement: 'on',
            title: {
                enabled: false
            }
        },
        yAxis: {
            title: {
                text: 'g/year'
            },
        },
        tooltip: {
            shared: true,
            valueSuffix: ' g/year'
        },
        plotOptions: {
            area: {
                stacking: 'normal',
                lineColor: '#666666',
                lineWidth: 1,
                marker: {
                    lineWidth: 1,
                    lineColor: '#666666'
                }
            }
        },
        series: CO2.sector_n2o
    });
};