class ProcessParam < ActiveRecord::Base
  belongs_to :wps_process

  # before_save { self.last_seen = DateTime.now }


  def self.createAll(params, id, input)
    if(input)
      key = :process_inputs
    else
      key = :process_outputs
    end

    paramCount = params[key].length

    for i in 0..paramCount - 1
      procParam = ProcessParam.new
      procParam.update_attributes(params[key][i.to_s])
      procParam.wps_process_id = id
      procParam.alive = true
      procParam.last_seen = DateTime.now
      procParam.is_input = input
      procParam.save
    end
  end
end

