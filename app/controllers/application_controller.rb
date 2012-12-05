
class ApplicationController < ActionController::Base
  protect_from_forgery

  # http://stackoverflow.com/questions/8060024/rails-produces-pgerror-server-closed-the-connection-unexpectedly-after-some-t

  prepend_before_filter :confirm_connection
  def confirm_connection
    c = ActiveRecord::Base.connection
    begin
      c.select_all "SELECT 1"
    rescue ActiveRecord::StatementInvalid
      ActiveRecord::Base.logger.warn "Reconnecting to database"
      c.reconnect!
    end
  end
end
