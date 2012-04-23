require 'test_helper'

class ModConfigsControllerTest < ActionController::TestCase
  setup do
    @mod_config = mod_configs(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:mod_configs)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create mod_config" do
    assert_difference('ModConfig.count') do
      post :create, mod_config: @mod_config.attributes
    end

    assert_redirected_to mod_config_path(assigns(:mod_config))
  end

  test "should show mod_config" do
    get :show, id: @mod_config
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @mod_config
    assert_response :success
  end

  test "should update mod_config" do
    put :update, id: @mod_config, mod_config: @mod_config.attributes
    assert_redirected_to mod_config_path(assigns(:mod_config))
  end

  test "should destroy mod_config" do
    assert_difference('ModConfig.count', -1) do
      delete :destroy, id: @mod_config
    end

    assert_redirected_to mod_configs_path
  end
end
