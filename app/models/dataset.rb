class Dataset < ActiveRecord::Base
  has_many :mod_configs, :through => :config_datasets
  has_many :config_datasets, :dependent => :destroy
  has_many :dataset_tags, :dependent => :destroy, :order => :tag
  has_many :dataset_folder_tags, :dependent => :destroy, :order => :folder_tag
  belongs_to :city
  belongs_to :dataserver

  before_save { self.last_seen = DateTime.now }

  # These properties are replicated in wms_functions.js and harvester.py
  @@versionWMS = "1.3.0"
  @@versionWFS = "1.1.0"
  @@versionWCS = "1.1.0"
  # MapServer is not able to project BBoxes in WGS84 passed in the 1.1.0 version
  @@versionWCSGetCoverage = "1.0.0" 
  @@longWGS84 = "urn:x-ogc:def:crs:EPSG:4326"

  def hasTag(tag)
    return getAliveTags(self).include?(tag)
  end

  # Example WCS
  # http://services.iguess.tudor.lu/cgi-bin/mapserv?map=/var/www/MapFiles/RO_localOWS_test.map&
  # SERVICE=WCS&VERSION=1.0.0&REQUEST=GetCoverage&IDENTIFIER=ro_dsm_mini&
  # FORMAT=image/tiff&BBOX=92213,436671.500,92348,436795.000&CRS=EPSG:28992&RESX=1&RESY=1
  
  # Example WFS: BBOX as y,x and extended EPSG definition 
  # http://maps.aberdeencity.gov.uk/arcgis/services/iGuess_WCS/MapServer/WFSServer?
  # REQUEST=GetFeature&VERSION=1.1.0&TYPENAME=iGuess_WCS:Scottish_Government_Data_Zone_Boundaries_2011&
  # MAXFEATURES=10&BBOX=49,-9,62,4,urn:x-ogc:def:crs:EPSG:4326&SRSNAME=EPSG:27700

  # Generates a WFS or WCS data request for the specified dataset
  # Pass nil for aoi if you aren't using one
  def getRequest(computationCrs, aoi)

    urlparams = ""

    if(not format.blank?) then 
      urlparams += "&FORMAT=" + format    
    end

    bboxSource = nil

    if aoi then
      bboxSource = aoi
    else
      bboxSource = self
    end

    # If no aoi is being used, or wasn't properly set, use any dataset bb that we have
    if bboxSource.bbox_left && bboxSource.bbox_right && bboxSource.bbox_top && bboxSource.bbox_bottom then
    
      if(service == "WCS") then 
        urlparams += "&BBOX=" + bboxSource.bbox_left.to_s()  + "," + bboxSource.bbox_bottom.to_s() + "," +
                                bboxSource.bbox_right.to_s() + "," + bboxSource.bbox_top.to_s()
      else # WFS
        urlparams += "&BBOX=" + bboxSource.bbox_bottom.to_s() + "," + bboxSource.bbox_left.to_s()  + "," +
                                bboxSource.bbox_top.to_s()    + "," + bboxSource.bbox_right.to_s() + "," +
                                @@longWGS84
      end
      
    end

    if(resolution_x and resolution_x.to_f > 0 and 
       resolution_y and resolution_y.to_f > 0) 
    then 
      urlparams += "&RESX=" + resolution_x.to_s()
      urlparams += "&RESY=" + resolution_y.to_s()
    end

    if(service == "WCS") then 
      urlparams += "&RESPONSE_CRS=" + computationCrs
      urlparams += "&CRS=" + @@longWGS84
    else
      urlparams += "&SRSNAME=" + computationCrs  
    end

    request = (service == "WCS") ? "GetCoverage" : "GetFeature"
    noun    = (service == "WCS") ? "COVERAGE"    : "TYPENAME"
    version = (service == "WCS") ? @@versionWCSGetCoverage : @@versionWFS

    return server_url + getJoinChar(server_url) +
              "SERVICE=" + service + urlparams +
              URI.escape("&VERSION=" + version + "&REQUEST=" + request + "&" + noun + "=" + identifier)
  end


  # Returns a list of processing tags for this dataset, with any dead tags filtered out, 
  # converted to an array of strings
  def getProcessingTagList()
    # Get a list of all tags that could be applied to dataset, including specials AOI and Mapping
    alltags = getSpecialTags(self).concat(getBaseTags(self))

    # This makes sure that any tags the dataset has are still connected to a registered process
    return DatasetTag.find_all_by_dataset_id(self.id, :order=>:tag)
                                                   .select {|d| alltags.include? d.tag }
                                                   .map {|d| d.tag }
  end  


  def getFolderTagList()
    DatasetFolderTag.find_all_by_dataset_id(self.id, :order=>:folder_tag)
                                                    .map {|d| d.folder_tag }
  end


  # Be sure to insert this code into a template using raw
  def insertGetCapabilitiesLinkBlock(wms, wfs, wcs, includeDataLink)
    output = ""

    # serverUrl = dataserver.url.gsub('\\', '%5C')   # Escape backslashes... why oh why???!?
    serverUrl = dataserver.url

    if wms then
      output += (output.length() ? ' ' : '') + '<a href="' + serverUrl + getJoinChar(serverUrl) + 
          'SERVICE=WMS&VERSION=' + @@versionWMS + '&REQUEST=GetCapabilities" target="_blank">WMS</a>'
    end

    # We could have both wfs and wcs true if we're showing all links in the technical details section
    if wfs or wcs then
      if wfs then
        output += (output.length() ? ' ' : '') + '<a href="' + serverUrl + getJoinChar(serverUrl) + 
            'SERVICE=WFS&VERSION=' + @@versionWFS + '&REQUEST=GetCapabilities" target="_blank">WFS</a>'
      end

      if wcs then
        output += (output.length() ? ' ' : '') + '<a href="' + serverUrl + getJoinChar(serverUrl) + 
            'SERVICE=WCS&VERSION=' + @@versionWCS + '&REQUEST=GetCapabilities" target="_blank">WCS</a>'
      end

      if includeDataLink then
        # Note that construction of the getRequest link can fail if the database is munged
        begin
          output += ' ' + '<a href="' + getRequest(city.srs, nil) + '" target="_blank">Get Data</a>'
        rescue
          # Don't add the link if we can't construct it!
        end
      end
    end

    return output
  end

end


def stripServerUrlAndIdentifier(item)
  item.delete("server_url")
  item.delete("identifier")
  return item
end


def jsonBuilder(dataset)
  json = dataset.as_json(:only => [:server_url, :identifier])
  # server_url
  json['configCount'] = dataset.mod_configs.count    # Number of configurations this layer is used in
  json['tags']        = dataset.dataset_tags.map { |t| t.tag }
  json['folder_tags'] = dataset.dataset_folder_tags.map { |t| t.folder_tag }
  json['id']          = dataset.id

  return json
end


# Build some json that looks like this, that will be sent to client in response to ajax request
# registeredDataLayers[datasetIdentifier] = {
#       "tags":        ['tag1', 'tag2', ...],
#       "folder_tags":['first', 'second',...],
#       "configCount": 3
#     };
public 
def buildRegisteredDataLayersJson(datasets)

  json = datasets.map{|d| jsonBuilder(d)}

  hash = Hash.new()
  json.map{|k| hash[k["identifier"]] = stripServerUrlAndIdentifier(k) }

  return hash.to_json
end



# Returns any special tags that can be applied to this dataset
# Note that we can also pass a service here, such as "WFS"
def getSpecialTags(dataset)

  if(dataset.is_a? String) then
    # Put dataset string into a list so we can treat it the same as the split result below
    serviceList = [dataset]     
  else
    if dataset.service.nil? then
      return []
    end
    serviceList = dataset.service.split(' ')
  end

  tags = []

  # Include AOI tag for WFS where we were passed a string OR we were passed a full 
  # dataset and that dataset has a non-blank bbox_top
  if serviceList.include?("WFS") and ((dataset.is_a? String) or 
        not dataset.bbox_top.blank?) then
    tags.push("Area of Interest")
  end

  # if serviceList.include?('WMS') then
  # TODO: For now we seem to assume that everyting has a WMS service... this will need to chanage
  # Assumption also made in c. 80 of datasets/index.html .erb
  if true then
    tags.push("Mapping")
  end

  return tags.sort_by{ |x| x.downcase }.uniq
end


# Returns the potential set of base tags for the dataset, with dead tags filtered out
# Note that we can also pass a service here, such as "WFS"
def getBaseTags(dataset)

  if (dataset.is_a? String) then
    serviceList = [dataset]    # Put dataset string into a list so we can treat it the same as the split result below
  else
    if dataset.service.nil? then
      return []
    end

    serviceList = dataset.service.split(' ')
  end

  if serviceList.include?("WFS") or serviceList.include?("WCS") then
    return ProcessParam.find_all_by_datatype_and_alive("ComplexData", :true)
                       .map{|p| p.identifier }
                       .sort_by{|x| x.downcase }
                       .uniq
  end

  return []
end


# Gets the list of all tags that have been applied to the dataset, excluding any dead ones
# Note that we can also pass a service here, such as "WFS"
def getAliveTags(dataset)
  if (dataset.is_a? String) then
    return getSpecialTags(dataset).concat(getBaseTags(dataset))
  else
    tags = []

    # Create list of tags from identifiers of registered WPS processes
    alivetags = ProcessParam.find_all_by_datatype_and_alive("ComplexData", :true)
                            .map{|p| p.identifier }
                            .concat(getSpecialTags(dataset))

    dataset.dataset_tags.each do |d| 
      if alivetags.include? d.tag then 
        tags.push(d.tag) 
      end
    end

    return tags
  end
end


# Return a list of active folder tags suitable for displaying in a dropdown list
def getAliveFolderTags()
  cityId = User.getCurrentCity(current_user, cookies).id
  
  return DatasetFolderTag.select("distinct folder_tag")
                         .joins(:dataset)
                         .merge(Dataset.where(:city_id => cityId))
                         .where("alive = true")
                         .map {|d| d.folder_tag }
                         .sort
end  


def getAoiDatasets(city)
  datasets = Dataset.find_all_by_city_id_and_alive(city.id, :true, :order=>"title")
  aois = []
  
  dataset = Dataset.new
  dataset.id = -1
  dataset.title = "Do not use an Area of Interest"
  aois.push(dataset)

  datasets.each do |d|
    if d.hasTag("Area of Interest") and not d.bbox_top.blank? then
      aois.push(d)
    end
  end

  return aois
end


def makeTag(dataset, tagVal)
  # Prevent duplicate tags
  if dataset and not dataset.dataset_tags.find_by_tag(tagVal) then
    tag            = DatasetTag.new
    tag.dataset_id = dataset.id
    tag.tag        = tagVal
    tag.save
  end
end 


def makeFolderTag(dataset, tagVal)
  # Prevent duplicate tags
  if dataset and not dataset.dataset_folder_tags.find_by_folder_tag(tagVal) then
    folder_tag            = DatasetFolderTag.new
    folder_tag.dataset_id = dataset.id
    folder_tag.folder_tag = tagVal
    folder_tag.save
  end
end 


# Make str into an name that is safe to use as a css identifier
# We have the equivalent in javascript as well
def cssEscape(str)
  return str.gsub(/[^a-z,A-Z,_,-,0-9]/, 'X')
end


def getJoinChar(serverUrl)
  return serverUrl.index("?") == nil ? "?" : "&"
end

