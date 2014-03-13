class WpsServer < ActiveRecord::Base
  has_many :mod_configs
  has_many :wps_processes
  has_many :process_params, :through => :wps_processes

  after_create { self.deleteable = true }				# Create undeletable servers directly via database
  before_save { self.last_seen = DateTime.now }


  # Note that this method can throw if something goes wrong!
  def self.addServer(url, server, details)
  	transaction do
	  	# Wrap the whoel thing below in a transaction so we don't end up with a 
	    # partial WPS server in our database.
	    # Note that all our saves use the save! method which will throw an error
	    # if there is a problem writing to the database.

      # Check if server is already registered... we expect it not to be
      wpsServer = WpsServer.find_by_url(url)

      if wpsServer then
        if !wpsServer.deleted then
          render :message => "Server is already registered!", :status => 403
          return false
        else    # We have a record for this, but was deleted at some point in past
          wpsServer.update_attributes(server)
        end
      else      # This is a brand new server
        wpsServer = WpsServer.new(server)
      end


      wpsServer.alive      = true
      wpsServer.deleted    = false

      wpsServer.save!

      wpsDetails = JSON[details]

      # Iterate over each process

      wpsDetails["wps_processes"].each do |ident, process|
        p = WpsProcess.new( :wps_server_id => wpsServer.id,
                            :identifier => process["identifier"], 
                            :title => process["title"], 
                            :abstract => process["abstract"],
                            :alive => true )
        p.save!

        process["dataInputs"].each do |input|
          if input["complex"] then 
            datatype = "complex"
          else
            datatype = "string"
          end

          i = ProcessParam.new( :wps_process_id => p.id,
                                :identifier => input["identifier"],
                                :title => input["title"],
                                :abstract => input["abstract"],
                                :datatype => datatype,
                                :min_occurs => input["minOccurs"] || 1,
                                :max_occurs => input["maxOccurs"] || 1,
                                :is_input => true,
                                :alive => true )
          i.save!
        end

        process["processOutputs"].each do |output|
          if output["complex"] then 
            datatype = "complex"
          else
            datatype = "string"
          end
          o = ProcessParam.new( :wps_process_id => p.id,
                                :identifier => output["identifier"],
                                :title => output["title"],
                                :abstract => output["abstract"],
                                :datatype => datatype,
																:min_occurs => output["minOccurs"] || 1,
																:max_occurs => output["maxOccurs"] || 1,
                                :is_input => false,
                                :alive => true )
          o.save!
        end
      end
    end   # end transaction
  end


end
