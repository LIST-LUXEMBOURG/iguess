class User < ActiveRecord::Base
  belongs_to :city
  
  has_many :co2_cenarios
  
  has_many :tickets
  has_many :ticket_follow_ups

  validates_presence_of :username, :city_id, :first_name, :last_name, :email
  validates_uniqueness_of :username, :email

  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :username, :email, :password, :password_confirmation, :remember_me, :city_id, :login, :first_name, :last_name
  after_create :send_admin_mail

  # Virtual attribute for authenticating by either username or email
  # This is in addition to a real persisted field like 'username'
  attr_accessor :login


  def send_admin_mail
    AdminMailer.new_user_waiting_for_approval(self).deliver
  end


  def self.send_reset_password_instructions(attributes={})
    recoverable = find_or_initialize_with_errors(reset_password_keys, attributes, :not_found)
    if !recoverable.approved?
      recoverable.errors[:base] << I18n.t("devise.failure.cant_reset_password_not_activated")
    elsif recoverable.persisted?
      recoverable.send_reset_password_instructions
    end
    recoverable
  end


  # Allow authentication against email addr or username 
  # (from https://github.com/plataformatec/devise/wiki/How-To:-Allow-users-to-sign-in-using-their-username-or-email-address)
  def self.find_first_by_auth_conditions(warden_conditions)
    conditions = warden_conditions.dup
    if login = conditions.delete(:login)
      where(conditions).where(["lower(username) = :value OR lower(email) = :value", { :value => login.downcase }]).first
    else
      where(conditions).first
    end
  end


  # See https://github.com/plataformatec/devise/wiki/How-To%3a-Require-admin-to-activate-account-before-sign_in
  def active_for_authentication? 
    super && approved? 
  end 


  def inactive_message
    if not approved? 
      :not_approved 
    else 
      super # Use whatever other message 
    end 
  end


  # Returns true if user is logged in, and either has global permissions or belongs to specified city
  def self.canAccessObject(current_user, object)
    if current_user.nil?
      return false
    elsif current_user.role_id == 2
      return true
    elsif current_user.city_id == object.city_id
      return true
    else
      return false
    end
  end


  def self.getCurrentCity(current_user, cookies)
    return (current_user and current_user.role_id == 1) ? (City.find_by_id(current_user.city_id)) : 
                                                          (City.find_by_id(cookies['city']) or City.first)
  end
 
end


class AdminMailer < ActionMailer::Base
  default to: Proc.new { "luis.a.de.sousa@gmail.com" }, #"luis.desousa@list.lu" },
          from: 'iguess@list.lu'


  def new_user_waiting_for_approval(user)
    @user = user
    @url  = 'http://iguess.tudor.lu/users/edit/' + user.id.to_s
    admins = User.find_all_by_is_admin true
    addr_list = Array.new
    admins.each do |admin| addr_list.push(admin.email) end
    binding.pry
    mail(to: addr_list, subject: "New User Awaiting Approval: #{@user.email}")
  end
  
  def welcome_email(user)
    @user = user
    @url  = 'http://iguess.tudor.lu'
    mail(to: @user.email, subject: 'Welcome to iGUESS!')
  end
end