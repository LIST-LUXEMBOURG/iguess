class TicketFollowUpsController < ApplicationController
  
  before_filter :authenticate_user!
  before_filter {|t| t.set_active_tab("tickets") }

  respond_to :html, :json, :js   # See http://railscasts.com/episodes/224-controllers-in-rails-3, c. min 7:00
  
  def create
    @ticket = Ticket.find(params[:ticket_id])
    @follow_up = TicketFollowUp.new
    @follow_up.ticket_id = @ticket.id
    @follow_up.user_id = current_user.id
    @follow_up.description = params[:ticket_follow_up][:description]
    @follow_up.save 
    redirect_to ticket_path(@ticket)
  end

end
