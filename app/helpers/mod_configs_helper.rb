module ModConfigsHelper
   # TODO: Put this in the database
   def getPrettyStatusName(statusCode)
      if(statusCode == 'NEEDS_DATA') then return 'Needs Data'    end
      if(statusCode == 'READY')      then return 'Ready'         end
      if(statusCode == 'RUNNING')    then return 'Running'       end
      if(statusCode == 'FINISHED')   then return 'Run Completed' end
      if(statusCode == 'ERROR')      then return 'Error'         end
   end
end
