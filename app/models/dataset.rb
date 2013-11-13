class Dataset < ActiveRecord::Base
  has_many :mod_configs, :through => :config_datasets
  has_many :config_datasets, :dependent => :destroy
  has_many :dataset_tags, :dependent => :destroy, :order => :tag
  belongs_to :city
  belongs_to :dataserver

  def hasTag(tag)
    return :true
  end

end


# Returns any special tags that can be applied to this dataset
# Note that we can also pass a service here, such as "WFS"
def getSpecialTags(dataset)

  if(dataset.is_a? String) then
    serviceList = [dataset]     # Put dataset string into a list so we can treat it the same as the split result below
  else
    if dataset.service.nil? then
      return []
    end
    serviceList = dataset.service.split(' ')
  end

  tags = []

  if serviceList.include?('WFS') then
    tags.push('Area of Interest')
  end

  # if serviceList.include?('WMS') then
  # TODO: For now we seem to assume that everyting has a WMS service... this will need to chanage
  # Assumption also made in c. 80 of datasets/index.html .erb
  if true then
    tags.push('Mapping')
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

  if serviceList.include?('WFS') or serviceList.include?('WCS') then
    return ProcessParam.find_all_by_datatype_and_alive('ComplexData', :true).map{ |p| p.identifier }.sort_by{ |x| x.downcase }.uniq
  end

  return []
end


# Returns the list of all tags that can be applied to the dataset
def getAllTags(dataset)
  return getSpecialTags(dataset).concat(getBaseTags(dataset))
end


# Gets the list of all tags that have been applied to the dataset, excluding any dead ones
# Note that we can also pass a service here, such as "WFS"
def getAliveTags(dataset)
  if (dataset.is_a? String) then
    return getSpecialTags(dataset).concat(getBaseTags(dataset))
  else
    tags = []

    alivetags = ProcessParam.find_all_by_datatype_and_alive('ComplexData', :true).map{ |p| p.identifier }.concat(getSpecialTags(dataset))

    dataset.dataset_tags.each do |d| 
      if alivetags.include? d.tag then 
        tags.push(d.tag) 
      end
    end

    return tags
  end
end



def getAoiDatasets(city)
  datasets = Dataset.find_all_by_city_id_and_alive(city.id, :true)

  aois = []
  datasets.each do |d|
    if d.hasTag("Area of Interest") then
      aois.push(d)
    end
  end

  return aois.sort_by{ |x| x.title.downcase }
end


def makeTag(dataset, tagVal)
  # Prevent duplicate tags
  if dataset and not dataset.dataset_tags.find_by_tag(tagVal) then
    tag = DatasetTag.new
    tag.dataset_id = dataset.id
    tag.tag = tagVal
    tag.save
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


def insertGetCapabilitiesLinkBlock(serverUrl, wms, wfs, wcs)
  output = "";

  if wms then
    output += (output.length() ? ' ' : '') + '<a href="' + serverUrl + getJoinChar(serverUrl) + 'SERVICE=WMS&VERSION=1.3.0&REQUEST=GetCapabilities" target="_blank">WMS</a>'
  end

  if wfs then
    output += (output.length() ? ' ' : '') + '<a href="' + serverUrl + getJoinChar(serverUrl) + 'SERVICE=WFS&VERSION=1.0.0&REQUEST=GetCapabilities" target="_blank">WFS</a>'
  end

  if wcs then
    output += (output.length() ? ' ' : '') + '<a href="' + serverUrl + getJoinChar(serverUrl) + 'SERVICE=WCS&VERSION=1.1.0&REQUEST=GetCapabilities" target="_blank">WCS</a>'
  end

  raw(output)
end
