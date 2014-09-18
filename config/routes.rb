Iguess::Application.routes.draw do

  # Use root as a shorthand to name a route for the root path “/”.
  root :to => "home#index"
  

  resources :mod_configs

  resources :cities


  put "wps_processes/register"
  put "wps_processes/unregister"
  get "wps_processes/process_query"

  resources :wps_servers


  get "datasets/dataset_query"

  # Tag handling
  put "datasets/del_tag"
  put "datasets/add_data_tag"
  put "datasets/add_data_folder_tag"

  # Bookmark management
  put "dataserver_bookmarks/create"
  put "dataserver_bookmarks/destroy"

  get "/datasets/check_name"

  resources :datasets 

  # resources :dataserver_bookmarks
  
  resources :config_datasets
  
  resources :maps


  # Handle user logins... remember that this needs to be BEFORE declaring the :users resources
  devise_for :users, :controllers => {:registrations => "registrations"}

  resources :users
  
  resources :compares

  resources :scenarios
  
  resources :dss

  resources :co2_scenarios do
   member do
    get 'replicate'
    get 'summary'
   end
  end
  

  

  match "about", :to => "about#index"

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


  match ":controller(/:action(/:id(.:format)))"
  
end
