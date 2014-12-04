class TicketsController < ApplicationController
  
  before_filter :authenticate_user!
  before_filter {|t| t.set_active_tab("tickets") }

  respond_to :html, :json, :js   # See http://railscasts.com/episodes/224-controllers-in-rails-3, c. min 7:00

  def new
    @ticket_types = TicketType.all
  end
 
  def create
    @ticket = Ticket.new(params[:ticket])
    @ticket.ticket_status_id = TicketStatus.getOpenId()
    @ticket.user_id = current_user.id
    @ticket.save
    redirect_to @ticket
  end
  
  def show
    @ticket = Ticket.find(params[:id])
    @closed = (@ticket.ticket_status_id == TicketStatus.getClosedId())
  end
  
  def index
    if current_user.is_admin then
      @tickets = Ticket.find_all_by_ticket_status_id(TicketStatus.getOpenId(), :order => "id DESC")
      @tickets_closed = Ticket.find_all_by_ticket_status_id(TicketStatus.getClosedId(), :order => "id DESC")
    else
      @tickets = current_user.tickets.find_all_by_ticket_status_id(TicketStatus.getOpenId(), :order => "id DESC")
      @tickets_closed = current_user.tickets.find_all_by_ticket_status_id(TicketStatus.getClosedId(), :order => "id DESC")
    end
  end
  
end

