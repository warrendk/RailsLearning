class DropStatsAgain < ActiveRecord::Migration[7.0]
   def up
    drop_table :stats
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
