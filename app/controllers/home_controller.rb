class HomeController < ApplicationController
  def geoproxy

    require 'net/http'
    require 'timeout'

    rawurl = CGI::unescape(params[:url])
    
    fixedurl = rawurl.gsub('\\', '%5C')   # Escape backslashes... why oh why???!?
    r = nil;

    status = 200
    content_type = 'text/html'
    
    timeout_duration = 15      # Give 5 second timeout...  long enough?

    begin
      Timeout::timeout(timeout_duration) {
        
        if request.get? then
        
          print "GeoProxy sending GET request to: " + String(fixedurl)
          
          res = Net::HTTP.get_response(URI.parse(fixedurl))
  
          status = res.code    # If there was an  error, pass that code back to our caller
          @page = res.body
          content_type = res['content-type']
        
        elsif request.post? then
          
          uri = URI(String(fixedurl))
          post = Net::HTTP::Post.new(uri.path + '?' + uri.query)
          post.body = String(request.body.read())
          post.content_type = 'text/xml' 
          
          res = Net::HTTP.start(uri.host, uri.port) do |http|
            http.request(post)
          end
          
          status = res.code    # If there was an  error, pass that code back to our caller
          @page = res.body
          content_type = res['content-type']
          
        else 
          
          print "GeoProxy couldn't decode request: " + String(fixedurl)
          
        end
        
      }

    rescue Timeout::Error
      @page = "TIMEOUT"
      status = 504    # 504 Gateway Timeout  We're the gateway, we timed out.  Seems logical.
    end

    render :layout => false, :status => status, :content_type => content_type
  end
end

