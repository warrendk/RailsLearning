class RemoveguessDistFromusers < ActiveRecord::Migration[7.0]
  def up
    remove_column :users, :guess_dist
  end
end
