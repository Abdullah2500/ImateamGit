import React, { useEffect } from "react";
import { DarkTheme, NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignUpStep1 from "./src/pages/Authenticate/pages/SignUpStep1";
import CreatePost from "./src/pages/Landing/pages/CreatePost/CreatePost";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SharedPost from "./src/pages/Landing/pages/CreatePost/SharedTo";
import Toast from "react-native-toast-message";
// import Fans from "./src/pages/BottomTabScreens/Fans";
import SignUpStep3 from "./src/pages/Authenticate/pages/SignUpStep3";
import OtpVerfication from "./src/pages/Authenticate/pages/otpVerification";
import SignUpStep2 from "./src/pages/Authenticate/pages/SignUpStep2";
import SignIn from "./src/pages/Authenticate/pages/SignIn";
import InitialScreen from "./src/pages/Authenticate/pages/InitialScreen";
import SplashScreen from "./src/pages/Authenticate/pages/SplashScreen";
import Menu from "./src/pages/BottomTabScreens/Menu";
import { store } from "./src/store";
import { Provider } from "react-redux";
import Teams from "./src/pages/BottomTabScreens/Teams/Main";
import MainTeamTab from "./src/pages/BottomTabScreens/Teams/Main";
import Calendar from "./src/pages/BottomTabScreens/Calendar";
import messaging from "@react-native-firebase/messaging";
import Messages from "./src/pages/BottomTabScreens/Messages";
import GetPostList from "./src/pages/BottomTabScreens/Teams/GetPostList";
import AccountSettings from "./src/pages/BottomTabScreens/Menu/AccountSettings";
import AddCreditCard from "./src/pages/BottomTabScreens/Menu/AddCreditCard";
import AccountPin from "./src/pages/BottomTabScreens/Menu/AccountPin";
import UpdatePassword from "./src/pages/BottomTabScreens/Menu/updatePassword";
import BackupEmail from "./src/pages/BottomTabScreens/Menu/BackupEmail";
import Geocoder from "react-native-geocoding";
import Search from "./src/pages/Landing/pages/search";
import FansStack from "./src/pages/BottomTabScreens/Fans/FansStack";
import LandingStack from "./src/pages/Landing/LandingStack";
import Loader from "./src/pages/BottomTabScreens/Messages/Components/Loader";
import SellerSignUp from "./src/pages/SellerSignUp";
import SellerSignUpThankYouPage from "./src/pages/SellerSignUp/SellerSignUpThankYouPage";
import StoreScreen from "./src/pages/BottomTabScreens/Store/StoreScreen";
import AddStore from "./src/pages/BottomTabScreens/Store/AddStore";
import AddProduct from "./src/pages/BottomTabScreens/Store/AddProduct";
import ProductScreen from "./src/pages/BottomTabScreens/Products/ProductScreen";
import AboutUs from "./src/pages/BottomTabScreens/Menu/MainMenu/AboutUs";
const Stack = createNativeStackNavigator();
const App = () => {
  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Authorization status:", authStatus);
    }
  }

  useEffect(() => {
    requestUserPermission();
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      Alert.alert("A new FCM message arrived!", JSON.stringify(remoteMessage));
    });
    Geocoder.init("AIzaSyBQyEE67gM0AvoJAzwp7fSdDlPqKwqKTxU", {
      language: "en",
    });
    return unsubscribe;
  }, []);

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          {/* <Loader /> */}
          <NavigationContainer>
            <Stack.Navigator initialRouteName="SplashScreen">
              <Stack.Screen
                name="InitialScreen"
                component={InitialScreen}
                options={{
                  gestureEnabled: false,
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="SignIn"
                component={SignIn}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="SignUpStep1"
                component={SignUpStep1}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="SellerSignUpThankYouPage"
                component={SellerSignUpThankYouPage}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="SignUpStep2"
                component={SignUpStep2}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="SignUpStep3"
                component={SignUpStep3}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="SplashScreen"
                component={SplashScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="OtpVerfication"
                component={OtpVerfication}
                options={{
                  headerShown: false,
                }}
              />
              {/* <Stack.Screen
                name="MainLanding"
                component={MainLanding}
                options={{
                  gestureEnabled: false,
                  headerShown: false,
                }}
              ></Stack.Screen> */}
              <Stack.Screen
                name="MainLanding"
                component={LandingStack}
                options={{
                  gestureEnabled: false,
                  headerShown: false,
                }}
              ></Stack.Screen>
              <Stack.Screen
                name="CreatePost"
                component={CreatePost}
                options={{
                  headerShown: false,
                }}
              ></Stack.Screen>
              <Stack.Screen
                name="SharedTo"
                component={SharedPost}
                options={{
                  headerShown: false,
                }}
              ></Stack.Screen>
              <Stack.Screen
                name="Fans"
                component={FansStack}
                options={{
                  gestureEnabled: false,
                  headerShown: false,
                }}
              ></Stack.Screen>
              <Stack.Screen
                name="Teams"
                component={Teams}
                options={{
                  gestureEnabled: false,
                  headerShown: false,
                }}
              ></Stack.Screen>
              <Stack.Screen
                name="MainTeam"
                component={MainTeamTab}
                options={{
                  headerShown: false,
                }}
              ></Stack.Screen>
              <Stack.Screen
                name="Calendar"
                component={Calendar}
                options={{
                  gestureEnabled: false,
                  headerShown: false,
                }}
              ></Stack.Screen>
              <Stack.Screen
                name="Messages"
                component={Messages}
                options={{
                  gestureEnabled: false,
                  headerShown: false,
                }}
              ></Stack.Screen>
              <Stack.Screen
                name="Menu"
                component={Menu}
                options={{
                  gestureEnabled: false,
                  headerShown: false,
                }}
              ></Stack.Screen>
              <Stack.Screen
                name="GetPostList"
                component={GetPostList}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="AccountSettings"
                component={AccountSettings}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="AddCreditCard"
                component={AddCreditCard}
                options={{
                  headerShown: false,
                }}
              />

              <Stack.Screen
                name="UpdatePassword"
                component={UpdatePassword}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="AccountPin"
                component={AccountPin}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="About"
                component={AboutUs}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="BackupEmail"
                component={BackupEmail}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="Search"
                component={Search}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="SellerSignUp"
                component={SellerSignUp}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="StoreScreen"
                component={StoreScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="AddStore"
                component={AddStore}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="ProductScreen"
                component={ProductScreen}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="AddProduct"
                component={AddProduct}
                options={{
                  headerShown: false,
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </Provider>
      </GestureHandlerRootView>
      <Toast />
    </>
  );
};

export default App;
