import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  BackHandler,
} from "react-native";
import {
  ValidateEmail,
  ValidatePassword,
  moveToNextScreen,
} from "../../../../../src/common/helper";
import axios from "axios";
import colors from "../../../../common/colors";
import Toast from "react-native-toast-message";
import InputFields from "../../.../../../../common/Components/InputFields/Index";
import { Logo } from "../../../../common/Components/Logo";
import ButtonCommon from "../../../../common/Components/Buttons";
import { styles } from "./styles";
import LoginAPI from "../../API/login";

const SignIn = ({ navigation }) => {
  const keyboardVerticalOffset = Platform.OS === "ios" ? 0 : 0;
  const [isLoading, setLoading] = useState(false);
  const [forgetPasswordClicked, setForgetPasswordClicked] = useState(false);

  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const checkAllFields = async () => {
    console.log("error====>", errors);
    if (errors.email !== "" || errors.password !== "") {
      if (errors.email !== "" && errors.password == "") {
        showToast3(errors.email);
      } else if (errors.password !== "" && errors.email == "") {
        showToast3(errors.password);
      } else {
        showToast3();
      }
    } else {
      if (user.email && user.password) {
        setLoading(true);
        const res = await LoginAPI(user.email.toLowerCase(), user.password);
        console.log("login resp", res);
        if (res?.token) {
          moveToNextScreen(navigation, "MainLanding");
          setLoading(false);
        } else if (res?.data?.detail) {
          //alert("Ooops! \n ", res.data.detail);
          // Alert.alert(JSON.stringify(res.data.detail));
          showToast2();
          console.log("i am here", res.data.detail);
          setLoading(false);
        } else {
          console.log(res.data.detail);
          setLoading(false);
        }
      } else {
        setLoading(false);
        showToast();
      }
    }
  };

  const sendResetEmail = async () => {
    if (user.email) {
      setLoading(true);
      try {
        const url = "https://dev.imateam.us:8443/auth/password/reset/";
        const body = { email: user.email };
        //  axios.post(url, body);
        const response = await axios.post(url, body);
        console.log("login responsse", response);
        if (response.data.email == user.email) {
          setForgetPasswordClicked(false);
          showPasswordResetToast(response.data.email);
          console.log("reset mail sent to ", response.data.email);
          setLoading(false);
        }
        console.log(response);
      } catch (error) {
        showPasswordResetErrorToast();
        console.log("password reset error");
        setLoading(false);
      }
    } else {
      showToast();
      setLoading(false);
    }
  };

  const showToast = () => {
    Toast.show({
      type: "error",
      text1: `Ooops`,
      text2: `Input Fields are Empty`,
      visibilityTime: 3000,
    });
  };
  const showToast3 = (txt) => {
    Toast.show({
      type: "error",
      text1: `Ooops`,
      text2: txt ? txt : `Please enter valid Email & password`,
      visibilityTime: 3000,
    });
  };
  const showPasswordResetErrorToast = () => {
    Toast.show({
      type: "error",
      text1: `Ooops`,
      text2: `Email is invalid`,
      visibilityTime: 3000,
    });
  };

  const showPasswordResetToast = (mail) => {
    Toast.show({
      type: "success",

      text2: `Password reset Email sent to ${mail}`,
      visibilityTime: 3000,
    });
  };
  const showToast2 = () => {
    Toast.show({
      type: "error",
      text1: `Ooops`,
      text2: `Invalid Email or Password`,
      visibilityTime: 3000,
    });
  };
  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        "hardwareBackPress",
        handleBackButtonClick
      );
    };
  }, []);

  function handleBackButtonClick() {
    navigation.goBack();

    return true;
  }

  const setLabelValue = (value, fieldName) => {
    setUser({
      ...user,
      [fieldName]: value,
    });
    let isValid = false;
    let errorMessage = "";
    if (fieldName === "email") {
      isValid = ValidateEmail(value);
      errorMessage = "Invalid or empty Email";
    } else if (fieldName === "password") {
      isValid = ValidatePassword(value);
      errorMessage = "Password must contain at least 8 characters";
    }
    if (isValid) {
      setErrors({
        ...errors,
        [fieldName]: "",
      });
    } else {
      setErrors({
        ...errors,
        [fieldName]: errorMessage,
      });
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <View style={styles.bg}>
        <View style={styles.container}>
          <ScrollView
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
          >
            <KeyboardAvoidingView
              behavior="position"
              keyboardVerticalOffset={keyboardVerticalOffset}
            >
              <Logo />
              {/* //header  */}
              <View style={styles.HeadingContainer}>
                {/* //main heading */}
                <Text style={styles.mainHeading}>Welcome to IMA Team</Text>
                {/* //sub heading */}
                <Text style={styles.subHeading}>
                  Connect with your Team/Groups
                </Text>
              </View>

              {/* //signup input InputFields */}

              <View style={styles.SignupButton}>
                <ButtonCommon
                  title={"Sign up for free"}
                  method={() => {
                    moveToNextScreen(navigation, "SignUpStep1");
                    setForgetPasswordClicked(false);
                    setLoading(false);
                  }}
                  color={colors.secondary}
                />
              </View>

              <InputFields
                error={errors.email}
                Label="Email*"
                Icon="email-open-outline"
                PlaceHolder="johnDoe@gmail.com"
                method={ValidateEmail}
                keyboard={"email-address"}
                setValue={(value) => setLabelValue(value, "email")}
              />
              {!forgetPasswordClicked ? (
                <InputFields
                  error={errors.password}
                  Label="Password*"
                  Icon="eye-outline"
                  PlaceHolder="********"
                  method={ValidatePassword}
                  secureTextEntry={true}
                  setValue={(value) => setLabelValue(value, "password")}
                />
              ) : null}
            </KeyboardAvoidingView>
            <View style={styles.forgetPassword}>
              {!forgetPasswordClicked ? (
                <Text
                  style={styles.Text}
                  onPress={() => {
                    console.log(
                      "forget password pressed state is ",
                      forgetPasswordClicked
                    );
                    setForgetPasswordClicked(true);
                    setLoading(false);
                  }}
                >
                  Forgot Password?
                </Text>
              ) : null}
            </View>

            {/* 
      //Button */}

            <ButtonCommon
              method={!forgetPasswordClicked ? checkAllFields : sendResetEmail}
              title={!forgetPasswordClicked ? "SIGN IN" : "Send reset email"}
              color={colors.primary}
              loading={isLoading}
            />
            <View style={styles.bottomText}>
              <Text style={styles.alreadyHaveAccount}>
                Don’t have an account?{" "}
                <Text
                  onPress={() => {
                    moveToNextScreen(navigation, "SignUpStep1");
                    setForgetPasswordClicked(false);
                    setLoading(false);
                  }}
                  style={styles.signIn}
                >
                  Sign Up{" "}
                </Text>
                to IMA Team
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default SignIn;
