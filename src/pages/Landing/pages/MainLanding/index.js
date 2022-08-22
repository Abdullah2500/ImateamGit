import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Image,
  KeyboardAvoidingView,
} from "react-native";
import Toast from "react-native-toast-message";
import Button from "./../../../../common/Components/AddPostsButton";
import Header from "../../../../common/Components/ProfileHeader";
import AppStatusBar from "../../../statusBarColor";
import Post from "../../../../common/Components/Post";
import BottomNavigation from "../../../../common/Components/BottomNavigation";
import icons from "../../../../common/icons";
import colors from "../../../../common/colors";
import MediaPicker from "../../../../common/Components/MediaPicker";
import { useGetUserQuery } from "../../../../Reducers/usersApi";
import {
  useGetCommentsQuery,
  useGetPostsQuery,
} from "../../../../Reducers/postsApi";
import AddInterestsModal from "../addInterestsModal";

import { getHeightPixel, getWidthPixel, font } from "../../../../common/helper";
import Loading from "../../../../common/Components/MainFrame";

const MainLanding = ({ navigation, route }) => {
  const [noMoreResults, setNoMoreResults] = useState(false);
  const [page, setPage] = useState(1);
  const [realPost, setRealPost] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [postAttachmentIndex, setPostAttachmentIndex] = useState(null);
  const [loading, setLoading] = useState(
    refreshing ? refreshing.status === "pending" : true ? data : true
  );
  const [searchModal, setSearchModal] = useState(false);

  const [endPost, setEndPost] = useState(false);
  const { data, isFetching } = useGetPostsQuery(page, {
    skip: noMoreResults,
  });
  const [attachmentShown, setAttachmentShown] = useState(false);
  const { data: userInfo, isFetching: fetch } = useGetUserQuery();
  const refreshedData = useGetPostsQuery();
  const [mVisible, setModalVisible] = useState(false);
  const [pickerData, setPickerData] = useState([]);
  const showModal = () => {
    setModalVisible(!mVisible);
  };
  const postListRef = useRef();
  const [isMediaLoading, setIsMediaLoading] = useState(false)

  useEffect(() => {
    if (route?.params?.type === "postCreated") {
      console.log("heeeeeeeeeeeeelo");
      setLoading(true);
      onRefresh();
    }
    if (route?.params?.type === "postDeleted") {
      let temp = [...realPost];
      temp = temp.filter((post) => post.id !== route?.params?.deletedPostId);
      setRealPost(temp);
    }

    // Return the function to unsubscribe from the event so it gets removed on unmount
    console.log("i am params", route?.params);
  }, [route?.params?.type, route?.params?.deletedPostId, loading]);

  useEffect(() => {
    console.log("LOAAAAAAAAADING ", loading);
  }, [realPost, loading, refreshing]);

  const onRefresh = () => {
    setRealPost([]);
    setLoading(true);
    refreshedData.refetch();
    console.log("refreshed data", refreshedData);
    console.log(" data", data);

    setPage(1);
  };
  const showToast = () => {
    Toast.show({
      type: "info",
      text2: `There are no new posts 👋 `,
      visibilityTime: 1500,
    });
  };

  const renderFooter = () => {
    return (
      //Footer View with Loader
      <View
        style={{
          padding: 10,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        {isFetching ? (
          <ActivityIndicator color="black" style={{ margin: 15 }} />
        ) : null}
      </View>
    );
  };

  const renderPosts = (post) => {
    const { item, index } = post;
    return (
      <View>
        <Post
          navigation={navigation}
          post={item}
          icons={icons}
          posts={realPost}
          postIndex={index}
          user_id={userInfo?.id}
          userDetails={userInfo}
          postListRef={postListRef.current}
          showAttachmentPicker={(val) => {
            setAttachmentShown(val);
            if (index !== postAttachmentIndex) {
              setPickerData([]);
            }
            setPostAttachmentIndex(index);
          }}
          attachmentShown={attachmentShown}
          pickerData={postAttachmentIndex === index ? pickerData : []}
          clearPickerData={setPickerData}
          setLoading={setLoading}
          isMediaLoading={isMediaLoading}
        />
      </View>
    );
  };

  useEffect(() => {
    if (refreshedData && !refreshedData?.isFetching) {
      setLoading(false);
      setRealPost(refreshedData?.data?.posts);
    }
  }, [refreshedData, loading]);

  useEffect(() => {
    if (data?.hasMore === false) {
      setEndPost(true);
      console.log("End POSTS HERE", endPost);
    } else if (data?.posts?.length) {
      console.log("data.posts: ===>", JSON.stringify(data.posts));
      if (realPost) {
        setRealPost([...realPost, ...data?.posts]);
      } else {
        setRealPost([...data?.posts]);
      }
    } else if (page > 1) {
      setNoMoreResults(true);
    }

    console.log("route has : ");

    BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        "hardwareBackPress",
        handleBackButtonClick
      );
    };
  }, [data, endPost]);

  function handleBackButtonClick() {
    BackHandler.exitApp();
    return true;
  }
  const keyExtractor = (item, index) => index.toString();
  const flatListRef = useRef(null)
  const flatListRef2 = useRef(null)
  const [flag, setFlag] = useState(false)
  useEffect(() => {
    setLoading(false)
  }, [flag])
  return (
    <View style={styles.container}>
      <SafeAreaView style={{ backgroundColor: "#fff" }}>
        <AppStatusBar backgroundColor="#fff" barStyle="dark-content" />
        {/* Header component */}
        <Header navigation={navigation} openModal={setSearchModal}
          mainFunc={() => {
            if (realPost.length > 0) {
              flatListRef2.current.scrollToIndex({ animated: true, index: 0 });
            }
          }}
        />
      </SafeAreaView>
      {/* ADD NEW POST BUTTON */}
      <View style={[styles.topButtons, {}]}>
        <TouchableOpacity
          style={[styles.button, {
            backgroundColor: 'red'
          }]}
          onPress={() => {
            navigation.navigate({
              name: "CreatePost",
              params: {
                postType: "createPost",
              },
            });
          }}
        >
          <Button />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondButton}
          onPress={() => {
            setModalVisible(true);
          }}
        >
          <Image
            source={require("../../../../common/assets/img/Add.png")}
            resizeMode={"stretch"}
          />
          <Text style={styles.interset}> Interest</Text>
        </TouchableOpacity>
      </View>

      {/* POST COMPONENT */}
      <KeyboardAvoidingView style={styles.listing}
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
        behavior={Platform.OS === "ios" ? "padding" : null}
        contentContainerStyle={{ flex: 1 }}
      >
        <FlatList
          data={realPost}
          ref={flatListRef2}
          renderItem={renderPosts}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyExtractor={keyExtractor}
          removeClippedSubviews={true}
          ListFooterComponent={renderFooter}
          showsVerticalScrollIndicator={false}
          onEndReached={() => {
            console.log("pagenois", page);
            if (!endPost) {
              console.log("i am at end", page);
              if (!isFetching) {
                setPage(page + 1);
              }
            } else {
              showToast();
            }
          }}
          onEndReachedThreshold={0.2}
        />
        <MediaPicker
          flag={attachmentShown}
          getPickerData={(data) => {
            console.log("data: ", data);
            if (!pickerData.length) {
              setPickerData(data);
            } else {
              setPickerData(pickerData.concat(data));
            }
            setAttachmentShown(false);
          }}
          showAttachmentPicker={(val) => setAttachmentShown(val)}
          setIsMediaLoading={(val) => {
            setIsMediaLoading(val)
            setTimeout(() => {
              setFlag(!flag)
            }, 200);
          }}
        />
      </KeyboardAvoidingView>
      {/* 
      <View style={styles.navigation}>
        <BottomNavigation navigation={navigation} />
      </View> */}
      <AddInterestsModal
        modal={setModalVisible}
        visibility={mVisible}
        list={userInfo?.interests}
      />
      <Loading isLoading={loading} backgroundColor={colors.white} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listing: {
    flex: 2,
  },
  button: {
    width: getWidthPixel(231),
    height: getHeightPixel(40),
  },
  navigation: {
    flex: 0.2,
    justifyContent: "center",
    backgroundColor: "black",
    paddingHorizontal: 5,
  },
  topButtons: {
    flexDirection: "row",
  },

  secondButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.accentGray,
    height: getHeightPixel(40),
    width: getWidthPixel(142),
    marginLeft: getWidthPixel(1),
  },
  interset: {
    ...font(14),
    fontWeight: "bold",
    color: colors.ghostWhite,
    paddingLeft: getWidthPixel(4),
  },
});
export default MainLanding;
