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

CO2.chartsInit = function()
{
	Highcharts.setOptions({
	   lang: {
	      thousandsSep: ' '
	   }
	});
};
        
CO2.addToSectorArrays = function(sector)
{
	CO2.sectorIndexes[sector] = CO2.lastIndex++;
	
	CO2.sector_demands.push({name: sector, data: new Array()});
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
	CO2.chartEmissions("co2_chart", "C02 Emissions by Sector", "ton/year", CO2.sector_co2);
	CO2.chartEmissions("ch4_chart", "CH4 Emissions by Sector", "g/year", CO2.sector_ch4);
	CO2.chartEmissions("n2o_chart", "N2O Emissions by Sector", "g/year", CO2.sector_n2o);
};

CO2.chartEmissions = function (div, title, units, series) 
{
    $('#' + div).highcharts({
        chart: {
            type: 'area'
        },
        credits: {
        	enabled: false
        },
        title: {
            text: title
        },
		subtitle: {
		    text: 'My custom subtitle'
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
                text: units
            },
        },
        tooltip: {
            shared: true,
            valueSuffix: ' ' + units
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
        series: series
    });
};

CO2.pieChart = function()
{
    $('#pie_chart').highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 1,//null,
            plotShadow: false
        },
        title: {
            text: 'Browser market shares at a specific website, 2014'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    }
                }
            }
        },
        series: [{
            type: 'pie',
            name: 'Browser share',
            data: [
                ['Firefox',   45.0],
                ['IE',       26.8],
                {
                    name: 'Chrome',
                    y: 12.8,
                    sliced: true,
                    selected: true
                },
                ['Safari',    8.5],
                ['Opera',     6.2],
                ['Others',   0.7]
            ]
        }]
    });
};

