class Dataset < ActiveRecord::Base
  has_many :mod_configs, :through => :config_datasets
  has_many :config_datasets, :dependent => :destroy
  has_many :dataset_tags, :dependent => :destroy
  belongs_to :city
  belongs_to :dataserver
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


#  + WMS.getCapUrl(dataset.server_url) + 