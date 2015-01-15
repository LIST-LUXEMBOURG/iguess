class TicketMailer < ApplicationMailer

  def new_ticket(ticket)
    @ticket = ticket
    @url = BASE_URL + '/tickets/' + @ticket.id.to_s
    admins = User.find_all_by_is_admin true
    addr_list = Array.new
    admins.each do |admin| addr_list.push(admin.email) end
    mail(to: addr_list, subject: "New Ticket: #{@ticket.title}")
  end
  
end