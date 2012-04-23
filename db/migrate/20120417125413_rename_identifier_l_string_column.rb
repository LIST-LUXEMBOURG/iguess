class RenameIdentifierLStringColumn < ActiveRecord::Migration
  def change
    rename_column("datasets", "identifierLstring", "identifier")
  end
end
