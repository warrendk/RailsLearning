class CreateStats < ActiveRecord::Migration[7.0]
  def change
    create_table :stats do |t|
      t.string :guess_dist

      t.timestamps
    end
  end
end
