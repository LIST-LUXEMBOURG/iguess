class HomeController < ApplicationController
  before_filter {|t| t.set_active_tab("home") }

  def index
    if user_signed_in?
      @user = User.find(current_user.id)
      @current_city  = User.getCurrentCity(current_user, cookies)
      @unapproved_users = User.find_all_by_approved_and_city_id(false, @current_city.id)
    end
  end

  def geoproxy

    require 'net/http'
    require 'timeout'

    rawurl = CGI::unescape(params[:url])
    id = params[:Id].to_s
    print "raw = " + rawurl
    
    
    fixedurl = rawurl.gsub('\\', '%5C')   # Escape backslashes... why oh why???!?

    status = 200
    content_type = 'text/html'
    
    begin
      Timeout::timeout(15) {        # Time, in seconds
        
        if request.get? then
          
          if fixedurl.last(3) == "CSW" then
            
            finalurl = rawurl + "&version=2.0.2&request=GetRecordById&ElementSetName=full&typeNames=gmd:MD_Metadata&outputSchema=http://www.isotc211.org/2005/gmd&Id=" + id
            res = Net::HTTP.get_response(URI.parse(finalurl))
            status = res.code
            content_type = res['content-type']
            @page = res.body
            print @page
            respond_to do |format|
              format.xml { render xml: @page}
            end
          else
            print "GeoProxy sending GET request to: " + String(fixedurl)
            
            res = Net::HTTP.get_response(URI.parse(fixedurl))
            print res.body
  
            status = res.code    # If there was an  error, pass that code back to our caller
            content_type = res['content-type']
   
            # if content_type.include? 'charset=' then
              @page = res.body
            # else
            #   @page = res.body.force_encoding('ISO-8859-1').encode('UTF-8')   # Force the encoding to be UTF-8
            render :layout => false, :status => status, :content_type => content_type
          end
        
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
          
          render :layout => false, :status => status, :content_type => content_type
        else 
          
          print "GeoProxy couldn't decode request: " + String(fixedurl)
          
        end
        
      }

    rescue Timeout::Error
      @page = "TIMEOUT"
      status = 504    # 504 Gateway Timeout  We're the gateway, we timed out.  Seems logical.
    end

    
  end
end

