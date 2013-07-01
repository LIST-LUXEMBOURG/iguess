class HomeController < ApplicationController
  def geoproxy

    require 'net/http'
    require 'timeout'

    rawurl = CGI::unescape(params[:url])
    
    fixedurl = rawurl.gsub('\\', '%5C')   # Escape backslashes... why oh why???!?
    r = nil;

    status = 200
    content_type = 'text/html'
    #content_type = 'text/xml'

    #binding.pry
    
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
          
          print "GeoProxy sending POST request to: " + String(fixedurl)
          
          #uri = URI.parse(String(fixedurl))
          uri = URI(String(fixedurl))
          post = Net::HTTP::Post.new(uri.path)
          post.body = String(request.body)
          post.content_type = 'text/xml' 
          
          #binding.pry
          
          res = Net::HTTP.start(uri.host, uri.port) do |http|
            http.request(post)
          end
          
          
          #res = Net::HTTP.start(url.host, url.port) {|http| http.request(post)}
                    
          #res = Net::HTTP.post_form(String(fixedurl), request.request_parameters)
          #res.body = request.body 
          #puts res.body
          
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

