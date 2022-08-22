import React, { useState } from "react";
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import colors from "../../../../common/colors";
import { font, getHeightPixel, getWidthPixel } from "../../../../common/helper";
import { useGetUserQuery } from "../../../../Reducers/usersApi";
import profileAlert from "../Api/profileAlertApi"

function SecuritySetting({ navigation }) {
  const { data: userInfo, isFetching, refetch } = useGetUserQuery();

  const [checks, setChecks] = useState({
    messagePrivacy: userInfo?.payload?.messagePrivacy,
    privateProfile: userInfo?.payload?.privateProfile,
  });

  const secureChecks = async (type) => {
    if (type === "MP") {
      let body = {
        messagePrivacy: !userInfo?.payload?.messagePrivacy,
      }
      let response = await profileAlert(body, userInfo.id)
      if (response) {
        console.log("Secure Response", response)
      }
    }
    if (type === "PP") {
      let body = {
        privateProfile: !userInfo?.payload?.privateProfile,
      }
      let response = await profileAlert(body, userInfo.id)
      if (response) {
        console.log("Secure Response", response)
      }
    }
  }



  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.ItemWrapper}>
        <View style={{ flex: 2 }}>
          <Text style={styles.optionTitle}>Account Password</Text>
          <Text style={styles.optionDesc}>
            Your current password, use a strong one please.
          </Text>
        </View>
        <TouchableOpacity style={styles.leftItem} onPress={() => navigation.navigate("UpdatePassword")}>
          <Text style={styles.optionDesc}>Change</Text>
          <Icon name="keyboard-arrow-right" size={21} color={colors.gray} />
        </TouchableOpacity>
      </View>
      <View style={styles.ItemWrapper}>
        <View style={{ flex: 2 }}>
          <Text style={styles.optionTitle}>Account Pin</Text>
          <Text style={styles.optionDesc}>
            Your account PIN, will be used to verify your identity.
          </Text>
        </View>
        <TouchableOpacity style={styles.leftItem} onPress={() => navigation.navigate("AccountPin")}>
          <Text style={styles.optionDesc}>Change</Text>
          <Icon name="keyboard-arrow-right" size={21} color={colors.gray} />
        </TouchableOpacity>
      </View>
      <View style={styles.ItemWrapper}>
        <View style={{ flex: 2 }}>
          <Text style={styles.optionTitle}>Backup Email</Text>
          <Text style={styles.optionDesc}>
            Address is not set, Will be used if primary email is unreachable.
          </Text>
        </View>
        <TouchableOpacity style={styles.leftItem} onPress={() => navigation.navigate("BackupEmail")}>
          <Text style={styles.optionDesc}>Change</Text>
          <Icon name="keyboard-arrow-right" size={21} color={colors.gray} />
        </TouchableOpacity>
      </View>
      <View style={styles.ItemWrapper}>
        <View style={{ flex: 2 }}>
          <Text style={styles.optionTitle}>Private Profile</Text>
          <Text style={styles.optionDesc}>
            Only known users can find / view your profile, turning this off will
            allow anyone on the site to find / view your profile.
          </Text>
        </View>
        <View style={styles.leftItem}>
          <Switch
            trackColor={{ false: colors.accentGray, true: colors.inputBlue }}
            thumbColor={colors.white}
            ios_backgroundColor={colors.accentGray}
            onChange={() => {
              setChecks({
                ...checks,
                privateProfile: !checks.privateProfile
              })
              secureChecks("PP")
            }}
            value={checks.privateProfile}
          />
        </View>
      </View>
      <View style={styles.ItemWrapper}>
        <View style={{ flex: 2 }}>
          <Text style={styles.optionTitle}>Message Privacy</Text>
          <Text style={styles.optionDesc}>
            No messages from unknown users, turning this off will allow anyone
            on the site to message you.
          </Text>
        </View>
        <View style={styles.leftItem}>
          <Switch
            trackColor={{ false: colors.accentGray, true: colors.inputBlue }}
            thumbColor={colors.white}
            ios_backgroundColor="#3e3e3e"
            onChange={() => {
              setChecks({
                ...checks,
                messagePrivacy: !checks.messagePrivacy
              })
              secureChecks("MP")
            }}
            value={checks.messagePrivacy}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ItemWrapper: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: getHeightPixel(17),
    paddingTop: getHeightPixel(29),
    borderBottomWidth: 1,
    paddingHorizontal: getWidthPixel(17),
    borderBottomColor: colors.ironGray,
  },
  optionTitle: {
    ...font(14, "600"),
    color: colors.mineShaft,
  },
  optionDesc: {
    ...font(12, "400"),
    color: colors.gray,
  },
  leftItem: {
    flexDirection: "row",
    alignItems: "center",
  },
});
export default SecuritySetting;
