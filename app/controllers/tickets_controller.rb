class TicketsController < ApplicationController
  
  before_filter :authenticate_user!
  before_filter {|t| t.set_active_tab("tickets") }

  respond_to :html, :json, :js   # See http://railscasts.com/episodes/224-controllers-in-rails-3, c. min 7:00

  def new
    @ticket_types = TicketType.all
  end
 
  def create
    @ticket = Ticket.new(params[:ticket])
    #binding.pry
    #@ticket = Ticket.new(
    #  params.require(:ticket).permit(
    #    :title, 
    #    :user_id, 
    #    :description, 
    #    :ticket_type_id, 
    #    :ticket_status_id, 
    #    :image
    #  ))
    @ticket.ticket_status_id = TicketStatus.find_by_value("Open").id
    @ticket.user_id = current_user.id
    @ticket.save
    redirect_to @ticket
  end
  
  def show
    @ticket = Ticket.find(params[:id])
  end
  
  def index
    @tickets = Ticket.all
  end
  
#  def code_image 
#    @image_data = Ticket.find(params[:id])
#    @image = @image_data.binary_data
#    send_data (@image), :type     => @image_data.content_type, 
#                       :filename => "Ticket_" + params[:id] + "_attachment", 
#                       :disposition => 'inline')
#  end
  
#  private
#  def ticket_params
#    params.require(:ticket).permit(:title, :user_id, :description, :ticket_type_id, :ticket_status_id, :image)
#  end
end