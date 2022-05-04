class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

         has_many :friends
         has_one  :stat

  # create a stat for the user
  after_create_commit :create_user_stat

  def create_user_stat
    self.create_stat(guess_dist: "", user_id: self.id)
  end
end
