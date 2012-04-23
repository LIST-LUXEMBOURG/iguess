require 'test_helper'

class WpsServersControllerTest < ActionController::TestCase
  setup do
    @wps_server = wps_servers(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:wps_servers)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create wps_server" do
    assert_difference('WpsServer.count') do
      post :create, wps_server: @wps_server.attributes
    end

    assert_redirected_to wps_server_path(assigns(:wps_server))
  end

  test "should show wps_server" do
    get :show, id: @wps_server
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @wps_server
    assert_response :success
  end

  test "should update wps_server" do
    put :update, id: @wps_server, wps_server: @wps_server.attributes
    assert_redirected_to wps_server_path(assigns(:wps_server))
  end

  test "should destroy wps_server" do
    assert_difference('WpsServer.count', -1) do
      delete :destroy, id: @wps_server
    end

    assert_redirected_to wps_servers_path
  end
end
