import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { tabDeselection } from "../../../Reducers/CommonReducers/mainLandingReducer";
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  Image,
  Dimensions,
  Alert,
  FlatList,
  BackHandler,
} from "react-native";
import AppStatusBar from "../../statusBarColor";
import ProfileHeader from "../../../common/Components/ProfileHeader";
import AddButton from "../Components/AddButton";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import colors from "../../../common/colors";
import {
  font,
  getHeightPixel,
  getWidthPercentage,
  getWidthPixel,
} from "../../../common/helper";
import BottomNavigation from "../../../common/Components/BottomNavigation";
import icons from "../../../common/icons";
import CheckIcon from "react-native-vector-icons/Ionicons";
import {
  PanGestureHandler,
  TouchableOpacity,
} from "react-native-gesture-handler";
import AddFansModal from "./AddFans";
import { ShowInitialsOfName } from "../../../common/Components/ShowInitialsOfName";
import FollowFan from "../API/followFanApi";
import UnFollowFan from "../API/unFollowFanApi";
import BlockFan from "../API/blockFanApi";
import { ActivityIndicator } from "react-native-paper";
import { useGetFansQuery, useGetUserQuery } from "../../../Reducers/usersApi";
import {
  useFollowFanMutation,
  useUnFollowFanMutation,
} from "../../../Reducers/usersApi";
import { addFansApi } from "./fansApi";
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/Feather";

const Tab = createMaterialTopTabNavigator();
const sampleProfile =
  "https://alchinlong.com/wp-content/uploads/2015/09/sample-profile-320x320.png";
const Fans = ({ navigation }) => {
  const { data: userInfo, isSuccess } = useGetUserQuery();
  const {
    data: fansData,
    isFetching,
    error,
    refetch,
  } = useGetFansQuery(userInfo?.id);
  const [addAFollow] = useFollowFanMutation();
  const [unfollowAFan] = useUnFollowFanMutation();
  const [statusList, setBlockList] = useState([]);
  const [searchFilter, setsearchFilter] = useState([]);
  const [isSelected, setisSelected] = useState("All");
  const [mainList, setMainList] = useState([]);
  const [openFansModal, setFansModal] = useState(false);
  const [searchInput, setSearchInput] = useState(false);
  const [updatedFans, setUpdatedFans] = useState([]);
  useEffect(() => {
    if (fansData?.length > 0) {
      setUpdatedFans(fansData);
    }
  }, [fansData]);
  const dispatch = useDispatch();
  console.log("mainList", mainList);
  const apiCall = async (id, action) => {
    console.log("ACTION", id, action);
    if (action === "follow") {
      // let body = {
      //   action: "following",
      //   connectionId: id,
      //   userOrTarget: "user",
      // };
      let body = {
        userIds: [id],
      };
      console.log("BODY", body);
      console.log("userInfo?.id==>", userInfo?.id);
      let response = await FollowFan(body, userInfo?.id);
      if (response) {
        console.log("follow response: ", response);
        refetch();
      } else {
        console.log("follow response error: ", response);
      }
    }
    if (action === "unfollow") {
      let body = {
        action: "remove",
        connectionId: id,
        userOrTarget: "user",
      };
      let response = await UnFollowFan(body, userInfo?.id);
      if (response) {
        console.log("unfollow response: ", response);
        refetch();
      } else {
        console.log("unfollow response error: ", response);
      }
    }
    if (action === "block") {
      let body = {
        action: "blocked",
        connectionId: id,
        userOrTarget: "target",
      };
      let response = await BlockFan(body, userInfo?.id);
      if (response) {
        console.log("block response: ", response);
        refetch();
      } else {
        console.log("block response error: ", response);
      }
    }
    if (action === "unblock") {
      let body = {
        connectionId: id,
        userOrTarget: "target",
        action: "following",
      };
      let response = await BlockFan(body, userInfo?.id);
      if (response) {
        console.log("unblock response: ", response);
        refetch();
      } else {
        console.log("unblock response: ", response);
      }
    }
  };

  // ON BACK PRESS CHANGE STATE OF BOTTOM TAB TO NULL
  BackHandler.addEventListener("hardwareBackPress", function () {
    dispatch(tabDeselection());
  });
  // FLATLIST RENDERED ITEM LIST FOR EACH VALUE
  const renderList = ({ item }) => (
    <View style={styles.listWrapper}>
      <View style={{ flexDirection: "row" }}>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("GetPostList", {
              id: item?.display_info?.id,
              type: "Member",
            });
          }}
        >
          <ShowInitialsOfName
            name={item?.display_info?.display_name}
            userId={item?.display_info?.id}
            size={40}
            radius={20}
            fontSize={18}
            imgUrl={
              item?.display_info?.avatar?.url !== "n/a" &&
              item?.display_info?.avatar?.url
            }
          />
        </TouchableOpacity>

        <View>
          <Text style={styles.listName}>
            {item?.display_info?.display_name}
          </Text>
          {!item.following ? (
            <TouchableOpacity onPress={() => apiCall(item.id, "follow")}>
              <Text style={styles.listStatus}>Follow</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                marginLeft: 14,
                alignItems: "center",
              }}
              onPress={() => apiCall(item.id, "unfollow")}
            >
              <CheckIcon
                name="checkmark-circle-sharp"
                color={colors.inputBlue}
                size={14}
              />
              <Text style={[styles.listStatus, { marginLeft: 3 }]}>
                Following
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* REMOVE THE PROFILE FROM StatusList TO UNBLOCK THE USER */}
      {item.target_type === "blocked" ? (
        <TouchableOpacity
          onPress={() => {
            showAlert("UNBLOCK", item.display_info.display_name, item.id);
          }}
          style={[styles.selectionWrapper, { backgroundColor: colors.pink }]}
        >
          <Text style={[styles.selectionText, { color: colors.blockRed }]}>
            Unblock
          </Text>
        </TouchableOpacity>
      ) : item.followed && !item.blocked ? (
        // BLOCK THE SELECTED USER AND ADD IT IN StatusList.....
        <TouchableOpacity
          style={styles.selectionWrapper}
          onPress={() => {
            showAlert("BLOCK", item.display_info.display_name, item.id);
          }}
        >
          <Text style={styles.selectionText}>Block</Text>
        </TouchableOpacity>
      ) : null}
      {}
    </View>
  );

  //   CONFIRMATION TOAST FOR BLOCKING THE USER
  const showAlert = (type, pname, id) => {
    if (type === "BLOCK") {
      Alert.alert("Confirmation", "Do You Want to Block " + pname + "?", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "YES", onPress: () => apiCall(id, "block") },
      ]);
    }
    if (type === "UNBLOCK") {
      Alert.alert("Confirmation", "Do You Want to Unblock " + pname + "?", [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { text: "YES", onPress: () => apiCall(id, "unblock") },
      ]);
    }
  };

  //FIRST FETCH THE DATA AND FILTER IT FOR EACH TAB (ONCE SELECTED)...
  const callme = (data) => {
    console.log("call me called");
    setMainList((pre) => (pre = [...data]));
  };

  // USESTATE FOR EACH TAB
  useEffect(() => {
    // fansData -> updatedFans
    if (isSelected === "All" && !isFetching && updatedFans?.length) {
      callme(updatedFans);
    } else {
      console.log("LOADING........");
    }
    if (isSelected === "Fans") {
      const newArr = [];
      for (var i = 0; i < updatedFans?.length; i++) {
        if (
          updatedFans[i].followed === true &&
          !updatedFans[i].display_info.organization
        ) {
          newArr.push(updatedFans[i]);
        }
      }
      callme(newArr);
    }
    if (isSelected === "Following") {
      const newArr = [];
      for (var i = 0; i < updatedFans.length; i++) {
        if (updatedFans[i].display_info.organization === false) {
          newArr.push(updatedFans[i]);
        }
      }
      callme(newArr);
    }
    if (isSelected === "Teams") {
      const newArr = [];
      for (var i = 0; i < updatedFans.length; i++) {
        if (updatedFans[i].display_info.organization === true) {
          newArr.push(updatedFans[i]);
        }
      }
      callme(newArr);
    }
    console.log(searchFilter);
  }, [isSelected, statusList, searchFilter, isFetching, fansData, updatedFans]);
  const pressed = useSharedValue(false);
  const startingPositionX = getWidthPixel(300);
  const startingPositionY = getHeightPixel(450);
  const x = useSharedValue(startingPositionX);
  const y = useSharedValue(startingPositionY);
  const eventHandler = useAnimatedGestureHandler({
    onStart: (event, ctx) => {
      pressed.value = true;
      ctx.startX = x.value;
      ctx.startY = y.value;
    },
    onActive: (event, ctx) => {
      x.value = ctx.startX + event.translationX;
      y.value = ctx.startY + event.translationY;
    },
    onEnd: (event, ctx) => {
      pressed.value = false;
      // x.value = withSpring(startingPosition);
      // y.value = withSpring(startingPosition);
    },
  });
  const uas = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: x.value }, { translateY: y.value }],
    };
  });

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <AppStatusBar backgroundColor="#fff" barStyle="dark-content" />
        <ProfileHeader navigation={navigation} />
      </SafeAreaView>
      <View>
        <View style={styles.fansSearchWrapper}>
          {searchInput ? (
            <TextInput
              style={styles.fansSearch}
              placeholder="Search fans..."
              placeholderTextColor={colors.lightSilver}
              width={100}
              onBlur={() => setsearchFilter([])}
              onChangeText={(value) => {
                setsearchFilter(
                  mainList?.filter((item) =>
                    item.display_info.display_name
                      .toLowerCase()
                      .includes(value.toLowerCase())
                  )
                );
              }}
            />
          ) : (
            <View style={[styles.fansSearch, { alignItems: "center" }]}>
              <Text style={{ ...font(18, "600") }}>Fans</Text>
            </View>
          )}

          <TouchableOpacity onPress={() => setSearchInput(!searchInput)}>
            <Image source={icons.SearchIcon} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.tabBar}>
        <TabButtons
          iconName="account-heart-outline"
          text="All"
          activeTab={isSelected}
          setActiveTab={setisSelected}
        />
        <TabButtons
          iconName="account-group-outline"
          text="Fans"
          activeTab={isSelected}
          setActiveTab={setisSelected}
        />

        <TabButtons
          iconName="calendar-blank-outline"
          text="Following"
          activeTab={isSelected}
          setActiveTab={setisSelected}
        />
        <TabButtons
          iconName="bubble"
          text="Teams"
          activeTab={isSelected}
          setActiveTab={setisSelected}
        />
      </View>
      {/* FLAT LIST FOR RENDERING THE LIST OF EACH USER */}
      <View style={{ flex: 1 }}>
        <PanGestureHandler onGestureEvent={eventHandler}>
          <Animated.View
            style={[
              {
                backgroundColor: colors.inputBlue,
                borderRadius: 30,
                height: 60,
                width: 60,
                position: "absolute",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 10,
              },
              uas,
            ]}
          >
            <TouchableOpacity onPress={() => setFansModal(true)}>
              <Icon
                name="plus"
                size={getWidthPixel(26)}
                style={{ padding: 16, color: "#fff" }}
              />
            </TouchableOpacity>
          </Animated.View>
        </PanGestureHandler>
        {isFetching ? (
          <ActivityIndicator color={colors.inputBlue} style={{ flex: 1 }} />
        ) : (
          <View style={styles.content2}>
            <FlatList
              style={{ zIndex: 5 }}
              data={searchFilter.length != 0 ? searchFilter : mainList}
              renderItem={renderList}
              refreshing={true}
            />
          </View>
        )}
      </View>
      <AddFansModal
        openModal={openFansModal}
        modal={setFansModal}
        id={userInfo?.id}
        setFans={(arr) => setUpdatedFans(arr)}
      />
    </View>
  );
};

const TabButtons = (props) => (
  <TouchableOpacity
    style={[
      styles.tabWrapper,
      {
        borderBottomColor:
          props.activeTab === props.text ? colors.inputBlue : "white",
      },
    ]}
    onPress={() => {
      props.setActiveTab(props.text);
    }}
  >
    <Text
      style={[
        styles.text,
        {
          color:
            props.activeTab === props.text
              ? colors.inputBlue
              : colors.accentGray,
        },
      ]}
    >
      {props.text}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: colors.silverWhite,
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  tabWrapper: {
    width: 80,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
  },
  text: {
    ...font(14, "bold"),
  },
  content2: { paddingHorizontal: 17, paddingVertical: 8 },
  listWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.lightSilver,
    paddingVertical: 15,
    flex: 1,
  },
  listImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  listName: {
    marginLeft: 14,
    ...font(16, "600"),
  },
  listStatus: {
    marginLeft: 14,
    ...font(14),
    color: colors.accentGray,
  },
  selectionWrapper: {
    alignItems: "center",
    marginLeft: 13,
    flexDirection: "row",
    backgroundColor: colors.lightGray,
    borderRadius: 20,
  },
  selectionText: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    ...font(14, "bold"),
    color: colors.mineShaft,
  },

  fansSearchWrapper: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderColor: colors.lightGray,
    borderBottomWidth: 1,
    borderTopWidth: 1,
  },
  fansSearch: {
    ...font(14),
    color: colors.mineShaft,
    width: getWidthPixel(225),
    paddingVertical: 0,
    paddingHorizontal: 20,
    marginRight: 2,
    flex: 1,
    // borderWidth: 1,
  },
});
export default Fans;
