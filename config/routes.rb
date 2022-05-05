Rails.application.routes.draw do

  devise_for :users
  devise_scope :user do
    get '/users/sign_out' => 'devise/sessions#destroy'
  end

  get 'home/wordle'
  root 'home#wordle'

  # any other route redirects to index
  match "*path" => redirect("/"), via: :get

  # included for ajax calls but not accessable to user via url
  resources :stats

  # all this is still functional, just dont want it part of the website anymore
  # delete 'friends/:id', to:'friends#destroy'
  # resources :friends
  # get 'home/index'
  # get 'home/about'
  # get 'friends/index'
end
