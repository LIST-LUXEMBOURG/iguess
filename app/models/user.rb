class User < ActiveRecord::Base
  belongs_to :city

  validates_presence_of :username, :city_id, :first_name, :last_name, :email
  validates_uniqueness_of :username, :email

  # Include default devise modules. Others available are:
  # :token_authenticatable, :confirmable,
  # :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  # Setup accessible (or protected) attributes for your model
  attr_accessible :username, :email, :password, :password_confirmation, :remember_me, :city_id, :login, :first_name, :last_name

  # Virtual attribute for authenticating by either username or email
  # This is in addition to a real persisted field like 'username'
  attr_accessor :login

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
    return (current_user and current_user.role_id == 1) ? City.find_by_id(current_user.city_id) : (City.find_by_name(cookies['city']) or City.first)
  end
end
