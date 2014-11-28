class TicketsController < ApplicationController
  def new
    @ticket_types = TicketType.all
  end
 
  def create
    @ticket = Ticket.new(params[:ticket])
 
    @ticket.save
    redirect_to @ticket
  end
  
  def show
    @ticket = Ticket.find(params[:id])
    @ticket_types = TicketType.all
  end
  
  def index
    @tickets = Ticket.all
  end
  
  #private
  #def ticket_params
  #  params.require(:ticket).permit(:title, :description, :ticket_type_id)
  #end
end