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

var DSS = DSS || { };

DSS.FeatureArray = function() 
{
    this.array = new Array();
};
 
DSS.FeatureArray.prototype.add = function(feature) 
{
    for(var i = 0; i < this.array.length; i++)
    	if(feature.isLowerThan(this.array[i]))
    	{
    		this.array.splice(i, 0, feature);
    		return;
    	}
    
   	this.array.push(feature);
};

DSS.FeatureArray.prototype.get = function(pos)
{
	if ((pos >= 0) && (pos < this.array.length))
		return this.array[pos];
	return null;
};

DSS.FeatureArray.prototype.getLast = function(pos)
{
		return this.array[this.array.length -1];
};

DSS.FeatureArray.prototype.getNearestFromCost = function(cost) 
{
    for(var i = this.array.length-1; i >= 0 ; i--)
    	if(this.array[i].cost <= cost)
    		return this.array[i];
    return this.array[0];
};

DSS.FeatureArray.prototype.getNearestFromInv = function(inv) 
{
    for(var i = this.array.length-1; i >= 0 ; i--)
    	if(this.array[i].inv <= inv)
    		return this.array[i];
    return this.array[0];
};

DSS.FeatureArray.prototype.getNearestFromGen = function(gen) 
{
    for(var i = this.array.length-1; i >= 0 ; i--)
    	if(this.array[i].gen <= gen)
    		return this.array[i];
    return this.array[0];
};

DSS.FeatureArray.prototype.getNearestFromArea = function(area) 
{
    for(var i = this.array.length-1; i >= 0 ; i--)
    	if(this.array[i].area <= area)
    		return this.array[i];
    return this.array[0];
};
