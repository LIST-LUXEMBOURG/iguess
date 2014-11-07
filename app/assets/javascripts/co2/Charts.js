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

CO2.referenceYear = 2020;

CO2.elecCategories = new Array();
CO2.elecSeries = new Array();

CO2.chartsInit = function()
{
	Highcharts.setOptions({
	   lang: {
	      thousandsSep: ' '
	   }
	});
	
	// Radialize the colors
    Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
        return {
            radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
            stops: [
                [0, color],
                [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
            ]
        };
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

CO2.addToElecSeries = function(source, period, value)
{
	
};

CO2.updatePeriodNames = function()
{
	base_year = parseInt(document.getElementById("co2_scenario_base_year").value);
	time_step = parseInt(document.getElementById("co2_scenario_time_step").value);
	CO2.periodNames[0] = base_year.toString();
	for (i = 1; i < CO2.numPeriods; i++)
		CO2.periodNames[i] = (base_year + i * time_step).toString();
};

CO2.calcPieSeries = function(baseYear)
{
	pieSeries = new Array();
	numPeriods = CO2.referenceYear - baseYear;

	for (sector = 0; sector < CO2.sector_demands.length; sector++)
	{
		interest = CO2.sector_demands[sector].growth - 
			       CO2.sector_demands[sector].efficiency;
			   
		pieSeries.push
		({
			name: CO2.sector_demands[sector].name, 
			y: CO2.sector_demands[sector].data[0] * Math.pow((1 + interest), numPeriods),
			sliced: true,
		});
	}
			
	return pieSeries;
};

CO2.drawCharts = function()
{
	CO2.chartArea("co2_chart", "C02 Emissions by Sector", null, "ton/year", CO2.sector_co2);
	CO2.chartArea("ch4_chart", "CH4 Emissions by Sector", null, "g/year", CO2.sector_ch4);
	CO2.chartArea("n2o_chart", "N2O Emissions by Sector", null, "g/year", CO2.sector_n2o);
};

CO2.chartArea = function (div, title, subtitle, units, series) 
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
		    text: subtitle
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

CO2.chartPie = function(div, title, subtitle, series)
{    
    $('#' + div).highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
        },
        title: {
            text: title
        },
        subtitle: {
            text: subtitle
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        credits: {
        	enabled: false
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
            name: 'Sector share',
            data: series
        }]
    });
};

CO2.chartColumnsPercent = function(div, title, subtitle, categories, series)
{
    $('#' + div).highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: title
        },
        subtitle: {
            text: subtitle
        },
        credits: {
        	enabled: false
        },
        xAxis: {
            categories: categories
        },
        yAxis: {
            min: 0,
            title: {
                text: '%'
            },
            stackLabels: {
                enabled: true,
                style: {
                    fontWeight: 'bold',
                    color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
                }
            }
        },
        tooltip: {
            formatter: function () {
                return '<b>' + this.x + '</b><br/>' +
                    this.series.name + ': ' + this.y + '<br/>' +
                    'Total: ' + this.point.stackTotal;
            }
        },
        plotOptions: {
            column: {
                stacking: 'percent',
                dataLabels: {
                    enabled: true,
                    color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
                    style: {
                        textShadow: '0 0 3px black, 0 0 3px black'
                    }
                }
            }
        },
        series: series
    });
};

