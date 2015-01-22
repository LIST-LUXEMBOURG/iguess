class ApplicationMailer < ActionMailer::Base
  # It should be possible to include all admins with the "to" directive
  # but it is not working
  default to: Proc.new { "iguess@list.lu" },
  from: 'iguess@list.lu'
  
  BASE_URL = 'http://iguess.list.lu'
  
end