class AddUserIdToStats < ActiveRecord::Migration[7.0]
  def change
    add_column :stats, :user_id, :integer
    add_index :stats, :user_id
  end
end
