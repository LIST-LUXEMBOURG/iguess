class ConfigTextInputsController < ApplicationController

  # This is only called with ajax, when a text field tied to an input or output is updated
  def update

    if not user_signed_in?
      return
    end

    @mod_config = ModConfig.find(params[:id])   # This is the mod_config we're working with

    # Find the config_text_input that we need to update
    ids = ConfigTextInput.find_all_by_mod_config_id_and_identifier_and_is_input(
                                @mod_config.id, params[:identifier], (params[:mode] == 'input'))


    # ids should have either 0 or 1 element in it

    inputval = params[:inputval].strip

    ok = :true

    if inputval.empty?    # User cleared the textbox: Find and delete ConfigTextInput 
      if ids.length > 0   # If ids.length == 0, we have nothing to delete
        @config_text_input = ConfigTextInput.find(ids[0])

        ok = @config_text_input.delete
      end

    else  # User specified an input value; either create a record or update our table
      if ids.length == 0          # If it has 0, we need to create a new copy
        @config_text_input = ConfigTextInput.new()
      else                        # Otherwise, find our existing copy
        @config_text_input = ConfigTextInput.find(ids[0])
      end

      @config_text_input.value = inputval
      @config_text_input.is_input = (params[:mode] == 'input')
      @config_text_input.mod_config = @mod_config
      @config_text_input.identifier = params[:identifier]

      ok = @config_text_input.save
    end

    respond_to do |format|
      if ok
        format.html { render :text => "UNKNOWN" }
        format.json { head :no_content }
      else
        format.html { render :text => "Error" }
        format.json { render json: @mod_config.errors, status: :unprocessable_entity }
      end
    end
  end

end
