Iguess::Application.routes.draw do

  # Use root as a shorthand to name a route for the root path “/”.
  root :to => "home#index"
  

  resources :mod_configs

  resources :cities


  resources :wps_servers do
    collection do
      put 'register'
      put 'unregister'
    end
  end

  get '/datasets/check_name',         to: 'datasets#check_name'
  get '/datasets/find_matching_tags', to: 'datasets#find_matching_tags'

  resources :datasets 

  resources :dataserver_urls
  
  resources :config_datasets
  
  resources :maps
  
  resources :compares

  resources :scenarios
  
  resources :dss

  devise_for :users, :controllers => {:registrations => "registrations"}

  match 'about', :to => 'about#index'

  # map.with_options :controller => 'about' do |about|
  #   about.about 'about', :action => 'about'
  #   # about.contact 'contact', :action => 'contact'
  # end
  
  get "home/index"
  get "home/geoproxy"
  

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  # root :to => 'welcome#index'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'


  match ':controller(/:action(/:id(.:format)))'
  
end
