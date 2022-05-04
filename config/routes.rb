Rails.application.routes.draw do
  resources :stats
  delete 'friends/:id', to:'friends#destroy'
  devise_for :users
  devise_scope :user do
    get '/users/sign_out' => 'devise/sessions#destroy'
    put 'home/updateGuessDist' => 'devise/registrations#update'
  end

  resources :friends
  get 'home/index'
  get 'home/practice'
  get 'home/about'
  get 'home/wordle'
  root 'friends#index'

  resources :home do
  collection do
    post 'updateGuessDist'
  end
end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
