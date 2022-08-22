import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  unstable_batchedUpdates,
  Image,
  TouchableOpacity,
} from "react-native";
import Header from "../../../../common/Components/HeaderCommon";
import styles from "./styles";
import OTPInputView from "@twotalltotems/react-native-otp-input";
import SetAccountPin from "../Api/SetAccountPin";
import { useGetUserQuery } from "../../../../Reducers/usersApi";
import colors from "../../../../common/colors";
import { getHeightPixel, getWidthPixel } from "../../../../common/helper";
import TeamLoader from "../../Teams/TeamProfileImage/TeamLoader";
import getUpdatedUserApi from "../Api/getUpdatedUserApi";

const AccountPin = ({ navigation }) => {
  const [pinCode, setPinCode] = useState("");
  const [pinCodeFilled, setPin] = useState(false);
  const [loading, setLoad] = useState(false)
  const { data: userData } = useGetUserQuery();
  const [showPin, setShowPin] = useState(false)
  const showPwd = require('../../../../common/assets/img/ShowPassword.png')
  const hidePwd = require('../../../../common/assets/img/HidePassword.png')
  const [isLoading, setIsLoading] = useState(false)

  const setUpPin = async () => {
    if (pinCode.length) {
      console.log("WOrking")
      setLoad(true)
      setPin(false);
      let response = await SetAccountPin(pinCode, userData.id);
      console.log('response => ', JSON.stringify(response))
      if (response) {
        setLoad(false)
        console.log("Account Pin", response);
        navigation.goBack();
      }
    }
    else {
      setPin(true);
    }
  };

  const getUpdatedUser = async () => {
    setIsLoading(true)
    const res = await getUpdatedUserApi()
    if (res.status == 200 && res?.data?.payload?.accountPin) {
      setPinCode(res?.data?.payload?.accountPin)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    getUpdatedUser()
  }, [])

  useEffect(() => {
    if (userData && userData?.payload?.accountPin) {
      setPinCode(userData?.payload?.accountPin)
    }
  }, [userData])

  return (
    <View style={{
      flex: 1
    }}>
      <SafeAreaView>
        <Header
          navigation={navigation}
          heading="Set Up Pin"
          btnTitle="Submit"
          Submit={true}
          onPressSubmit={() => {
            setUpPin()
            console.log("Check You!!!", pinCode, pinCodeFilled)
          }}
          loading={loading}
        />

        <View style={styles.container}>
          <TouchableOpacity onPress={() => setShowPin(!showPin)}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              width: '100%',
              paddingHorizontal: getWidthPixel(40),
              paddingTop: getHeightPixel(10)
            }}>
              <Image source={showPin ? hidePwd : showPwd} style={{
                height: getHeightPixel(25),
                width: getWidthPixel(25),
              }} />
            </View>
          </TouchableOpacity>
          <OTPInputView
            style={styles.OTPContainer}
            pinCount={6}
            autoFocusOnLoad={false}
            code={pinCode}
            codeInputFieldStyle={styles.underlineStyleBase}
            codeInputHighlightStyle={styles.underlineStyleHighLighted}
            keyboardType='numeric'
            secureTextEntry={showPin ? false : true}
            onCodeFilled={(code) => {
              // unstable_batchedUpdates(() => {
              setPinCode(code);
              // });
            }}
          />
          {pinCodeFilled ? <Text style={styles.errMsg}>Enter full code.</Text> : null}
        </View>

      </SafeAreaView>
      {
        isLoading && <TeamLoader />
      }
    </View>
  );
};

export default AccountPin;
