class HomeController < ApplicationController
  def geoproxy

    require 'net/http'

    rawurl = CGI::unescape(params[:url])
    fixedurl = rawurl.gsub('\\', '%5C')   # Escape backslashes... why oh why???!?
    r = nil;

    status = 200


    begin
      r = Net::HTTP.get_response(URI.parse(fixedurl))

      status = r.code    # If there was an error, pass that code back to our caller
      @page = r.body

    rescue SocketError => e
      @page = "ERROR #{e}"
    rescue Timeout::Error => e
      @page = "ERROR #{e}"
    end

    render :layout => false, :status => status
  end
end




