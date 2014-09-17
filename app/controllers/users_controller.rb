class UsersController < ApplicationController
  before_filter {|t| t.set_active_tab("users") }
  
  def edit
    @user = User.find_by_id(params[:id])

    if not User.canAccessObject(current_user, @user)
      showError("Insufficient permissions -- you cannot access this object!")
      return
    end
  end

  def update
    
    @user = User.find(params[:id])

    if not User.canAccessObject(current_user, @user)
      showError("Insufficient permissions -- you cannot modify this object!")
      return
    end

    respond_to do |format|
      params[:user][:approved] = 1
      if @user.update_attributes(params[:user], :without_protection => true) then
      	# @user.approved = params[:user][:approved]
      	# @user.save 

        format.html { redirect_to '/', notice: "User was successfully approved." }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @user.errors, status: :unprocessable_entity }
      end
    end
  end
  
  def reject
    
    @user = User.find(params[:id])

    if not User.canAccessObject(current_user, @user)
      showError("Insufficient permissions -- you cannot modify this object!")
      return
    end
    
    respond_to do |format|
      @user.delete
      format.html { redirect_to '/', notice: "User was successfully rejected." }
      format.json { head :no_content }
    end           
  end

end