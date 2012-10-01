class HomeController < ApplicationController
  def geoproxy

    require 'net/http'
    require 'timeout'

    rawurl = CGI::unescape(params[:url])
    fixedurl = rawurl.gsub('\\', '%5C')   # Escape backslashes... why oh why???!?
    r = nil;

    status = 200

    
    timeout_duration = 5      # Give 5 second timeout...  long enough?

    begin
      Timeout::timeout(timeout_duration) {
        r = Net::HTTP.get_response(URI.parse(fixedurl))

        if(r.nil?)
          binding.pry
        end

        status = r.code    # If there was an  error, pass that code back to our caller
        @page = r.body
      }

    rescue Timeout::Error
      @page = "TIMEOUT"
      status = 504    # 504 Gateway Timeout  We're the gateway, we timed out.  Seems logical
    end

    render :layout => false, :status => status
  end
end




