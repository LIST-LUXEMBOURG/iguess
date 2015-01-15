class AdminMailer < ApplicationMailer

  def new_user_waiting_for_approval(user)
    @user = user
    # The domain model does not effectively link users to a particular site.
    # Thus the default URL is sent.
    @url  = BASE_URL + '/users/edit/' + user.id.to_s
    admins = User.find_all_by_is_admin true
    addr_list = Array.new
    admins.each do |admin| addr_list.push(admin.email) end
    mail(to: addr_list, subject: "New User Awaiting Approval: #{@user.first_name} #{@user.last_name}")
  end
  
  def welcome_email(user)
    @user = user
    # The domain model does not effectively link users to a particular site.
    # Thus the default URL is sent.
    @url  = BASE_URL
    mail(to: @user.email, subject: 'Welcome to iGUESS!')
  end
end