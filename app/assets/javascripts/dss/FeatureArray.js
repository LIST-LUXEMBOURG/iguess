/**
 * Copyright (C) 2010 - 2014 CRP Henri Tudor
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
 * Date: 07-11-2013
 *
 * FeatureArray Class.
 */ 

function DSS.FeatureArray () 
{
    this.array = new Array();
};
 
DSS.FeatureArray.prototype.add = function(feature) 
{
    for(i = 0; i < this.array.length; i++)
    	if(feature.isLowerThan(this.array[i]))
    	{
    		this.array.splice(i, 0, feature);
    		return;
    	}
};

DSS.FeatureArray.prototype.getNearestFromCost = function(cost) 
{
    for(i = this.array.length-1; i >= 0 ; i--)
    	if(this.array[i].cost <= cost)
    		return this.array[i];
    return null;
};

