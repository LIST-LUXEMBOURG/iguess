class ConfigDatasetsController < ApplicationController

  # This is only called with ajax
  def update
    @mod_config = ModConfig.find(params[:id])   # This is the mod_config we're working with

    # Find the ConfigDataset that we need to update
    ids = ConfigDataset.all(:joins      => "left join datasets on datasets.id = config_datasets.dataset_id",
                            :conditions => "config_datasets.mod_config_id = " + @mod_config.id.to_s + " " +
                                           "and datasets.dataset_type = '"    + params[:identifier]  + "'"   )

    # ids should have either 0 or 1 element in it

    ok = :true

    if params[:dataset] == "-1"   # Find and delete ConfigDataset -- if ids.length == 0, we have nothing to do
      if ids.length > 0
        @config_dataset = ConfigDataset.find(ids[0])

        ok = @config_dataset.delete
      end

    else  # User specified a dataset; either create or update our table
      if ids.length == 0          # If id is empty, we need to create a new configDataset record
        @config_dataset = ConfigDataset.new()
      else                        # Otherwise, use our existing copy
        @config_dataset = ConfigDataset.find(ids[0])
      end

      @dataset = Dataset.find(params[:dataset])   # This is the dataset the user selected

      @config_dataset.dataset    = @dataset
      @config_dataset.mod_config = @mod_config

      ok = @config_dataset.save
    end

    respond_to do |format|
      if ok
        format.html { render :text => "OK"  }
        format.json { head :no_content }
      else
        format.html { render :text => "Error" }
        format.json { render json: @mod_config.errors, status: :unprocessable_entity }
      end
    end
  end

end
