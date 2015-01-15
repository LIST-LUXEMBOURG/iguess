class ApplicationMailer < ActionMailer::Base
  # It should be possible to include all admins with the "to" directive
  # but it is not working
  default to: Proc.new { "iguess@list.lu" },
  from: 'iguess@list.lu'
  
  def initialize(arg0, arg1)
    @base_url = 'http://iguess.list.lu'
  end
  
end