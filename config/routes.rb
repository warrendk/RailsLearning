Rails.application.routes.draw do
  delete 'friends/:id', to:'friends#destroy'
  devise_for :users
  devise_scope :user do
    get '/users/sign_out' => 'devise/sessions#destroy'
  end
  resources :friends
  get 'home/index'
  get 'home/practice'
  get 'home/about'
  get 'home/wordle'
  root 'friends#index'
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Defines the root path route ("/")
  # root "articles#index"
end
