import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  StyleSheet,
  Platform,
  Alert,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import TopHeader from "../../../BottomTabScreens/Components/TopHeader";
import {
  useGetUserQuery,
  useGetFansQuery,
} from "../../../../Reducers/usersApi";
import { useGetTeamMembersQuery } from "../../../../Reducers/teamsApi";
import {
  getHeightPixel,
  getWidthPixel,
  showInitials,
} from "../../../../common/helper";
import SearchWithTags from "../Components/SearchWithTags";
import colors from "../../../../common/colors";
import BottomSheet from "@gorhom/bottom-sheet";
import BottomSheetModal from "../Components/BottomSheetModal";
import MessageComponent from "../Components/MessageComponent";
import RNFS from "react-native-fs";
import DocumentPicker from "react-native-document-picker";
import ImgToBase64 from "react-native-image-base64";
import ImagePicker from "react-native-image-crop-picker";
import { getAllConversations, startConversationApi } from "../API/messagesApi";
import InputChat from "../GroupChat/components/InputChat";
import { useDispatch, useSelector } from "react-redux";
import { updateChatList } from "../../../../Reducers/CommonReducers/chatSlice";

const StartConversation = ({ navigation, route }) => {
  const allChats = useSelector((state) => state.chat.existingChats);
  const teamObj = route.params?.teamObj ? route.params?.teamObj : null;
  const fanObj = route.params?.fanObj ? route.params?.fanObj : null;
  const { data: membersData } = useGetTeamMembersQuery(teamObj?.id);
  // console.log('membersData -> ', membersData)
  console.log("teamsObj -> ", teamObj);
  const { data: userInfo, isSuccess } = useGetUserQuery();
  const {
    data: fansData,
    isFetching,
    error,
    refetch,
  } = useGetFansQuery(userInfo?.id);
  const [fansList, setFansList] = useState([]);
  const [message, setMessage] = useState("");
  const fileBottomSheetRef = useRef(null);
  const [imageArray, setImageArray] = useState([]);
  const [flag, setFlag] = useState(false);
  const [isMembersSet, setIsMembersSet] = useState(false);
  const [chatName, setChatName] = useState("");
  const [loader, setLoader] = useState(false);
  const dispatch = useDispatch();
  // for members Listings
  const [teamMembersList, setTeamMembersList] = useState([]);
  const [idArray, setIdArray] = useState([]);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true); // or some other action
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false); // or some other action
      }
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const navToChat = async () => {
    console.log("fan -> ", fanObj?.id);
    setLoader(true);
    try {
      const res = await getAllConversations();
      setLoader(false);
      if (res.resultCode == 200) {
        console.log("getAllConversations response here");
        let tempObj;
        if (res.data.length > 0) {
          res.data.map((chat) => {
            if (chat.name == "") {
              obj = chat.users.find((user) => user.id == fanObj?.id);
              if (obj) {
                tempObj = chat;
              }
            }
          });
        }
        if (tempObj) {
          navigation.navigate("SingleChat", { chatObj: tempObj });
        } else {
          navigation.navigate("MessagesMain");
        }
      }
    } catch (e) {
      console.log("Error navigating to Chats, ", e);
      setLoader(false);
    }
  };

  useEffect(() => {
    if (membersData && membersData.length > 0 && !isMembersSet) {
      let arr = [];
      let ids = [];
      membersData.map((item) => {
        arr.push({
          id: item.user_info.id,
          display_name: item.user_info.display_name,
        });
        ids.push(item.user_info.id);
      });
      setIdArray(ids);
      setTeamMembersList(arr);
      setIsMembersSet(true);
    }
  }, [membersData]);

  useEffect(() => {
    console.log("userinfo.id", userInfo.id);
    if (userInfo) {
      if (!idArray.includes(userInfo.id)) {
        setIdArray([...idArray, userInfo.id]);
      }
    }
    if (fanObj && userInfo) {
      setIdArray([userInfo.id, fanObj.id]);
    }
  }, [userInfo, fanObj]);

  console.log("idArray -> ", idArray);

  useEffect(() => {
    if (fansData?.length > 0) {
      let arr = [];
      fansData.map((item) =>
        arr.push({
          id: item.display_info.id,
          name: item.display_info.display_name,
        })
      );
      setFansList(arr);
    }
  }, [fansData]);

  const itemPressed = (arr) => {
    // console.log('array from tagsComponent', arr)
    let newArrIds = [];
    arr.map((item) => newArrIds.push(item.id));
    // console.log('newArrIds -> ', newArrIds)
    setIdArray(newArrIds);
  };

  const fileBottomClose = () => {
    console.log("closed");
    fileBottomSheetRef.current.close();
  };
  const fileBottomOpen = () => {
    console.log("open");
    fileBottomSheetRef.current.expand();
  };

  // Convert Image to Base64
  const convertImageToBase64 = async (img) => {
    console.log("img: ", img);
    if (img.fileInfo.fileType.substring(0, 2) == "vi") {
      console.log("this is video");
      RNFS.readFile(img.path, "base64").then((RNFSresponse) => {
        // console.log("RNFSresponse: ", RNFSresponse);
        const obj = {
          data: RNFSresponse,
          fileInfo: {
            filename: img.fileInfo.filename,
            fileSize: img.fileInfo.fileSize,
            fileType: img.fileInfo.fileType,
          },
        };
        let temArray = imageArray;
        temArray.push(obj);
        setImageArray(temArray);
      });
    } else {
      if (img.path) {
        ImgToBase64.getBase64String(img.path)
          .then((base64String) => {
            //   console.log("base64String: ", base64String);
            const temp = base64String;
            const imgobj = {
              data: temp,
              fileInfo: img.fileInfo,
              path: img.path,
            };
            let temArray = imageArray;
            temArray.push(imgobj);
            console.log("temArray.length ->", temArray.length);
            console.log("imageArray.length -> ", imageArray.length);
            setImageArray(temArray);
            // getPickerData(imageArray);
            // setImageArray([]);

            console.log(" images array", imageArray.length);
            //return temp;
          })
          .catch((err) => "not converted");
      }
    }
    setTimeout(() => setFlag(!flag), 500);
  };

  // Gallery Image
  const chooseImage = async () => {
    fileBottomClose();
    await ImagePicker.openPicker({
      width: getWidthPixel(300),
      height: getHeightPixel(400),
      cropping: false,
      multiple: true,
      mediaType: "any",
      useFrontCamera: true,
      smartAlbums: [
        "UserLibrary",
        "PhotoStream",
        "Panoramas",
        "Videos",
        "Bursts",
      ],
    }).then((image) => {
      //setUri(image.path);
      console.log("ma image wala hn", image);
      image.map((item) => {
        let imageName = item.filename;
        if (Platform.OS === "android") {
          imageName = new Date();
          console.log(" time stamp", imageName);
        }

        const imgobj = {
          path: item.path,
          // data: convertImageToBase64(item.path),
          fileInfo: {
            filename: imageName,
            fileSize: item.size,
            fileType: item.mime,
          },
        };
        console.log("item -> ", item);
        convertImageToBase64(imgobj);
      });
    });
    // console.log("i am image converted in base 64", Uri);
    setTimeout(() => setFlag(!flag), 500);
  };

  // Document
  const chooseDocument = async () => {
    fileBottomClose();
    console.log("document picker called");
    try {
      const pickerResult = await DocumentPicker.pick({
        type: DocumentPicker.types.pdf,
        allowMultiSelection: true,
      });
      //  console.log("pickerResult: ", pickerResult);
      pickerResult.map(async (item) => {
        //  console.log("item: ", item);
        RNFS.readFile(item.uri, "base64").then((RNFSresponse) => {
          // console.log("RNFSresponse: ", RNFSresponse);

          const obj = {
            data: RNFSresponse,
            fileInfo: {
              filename: item.name,
              fileSize: item.size,
              fileType: item.type,
            },
          };

          let temArray = imageArray;
          temArray.push(obj);
          //console.log("temArray", temArray);
          setImageArray(temArray);
        });
      });
    } catch (error) {
      console.log("error in picking file", error);
    }
    setTimeout(() => setFlag(!flag), 500);
  };

  // Camera
  const chooseCamera = async () => {
    fileBottomClose();
    await ImagePicker.openCamera({
      width: getWidthPixel(300),
      height: getHeightPixel(400),
      //  cropping: true,
      multiple: true,
      mediaType: "photo",
      // useFrontCamera: true,
    }).then((image) => {
      //setUri(image.path);
      console.log("ma image wala hn", image);

      let imageName = new Date();

      console.log(" time stamp", imageName);
      // image.map((item) => {
      const imgobj = {
        path: image.path,
        // data: convertImageToBase64(item.path),
        fileInfo: {
          filename: imageName,
          fileSize: image.size,
          fileType: image.mime,
        },
      };

      convertImageToBase64(imgobj);
      //   );
    });
    setTimeout(() => setFlag(!flag), 500);
    // console.log("i am image converted in base 64", Uri.length);
  };

  const sendMessagePressed = async () => {
    console.log(idArray.length, "oo");
    if (idArray.length > 2 && chatName == "") {
      Alert.alert("Alert!", "Chat name can not be empty");
      return;
    }
    if (message == "" && imageArray.length == 0) {
      Alert.alert(
        "Message empty!",
        "Either write a message or add attachments."
      );
      return;
    }
    let body = {};
    let mlist = idArray;
    if (!idArray.includes(userInfo.id)) {
      mlist.push(userInfo.id);
    }
    body["userIds"] = mlist;
    let keyString = ``;
    mlist.map((item) => (keyString = keyString + item + "-"));
    body["payload"] = {
      x: {
        key: keyString.slice(0, -1),
        typing: null,
      },
    };
    body["message"] = {
      message: message,
    };
    body["files"] = imageArray;
    (body["name"] = chatName), (body["accountId"] = userInfo?.id);
    try {
      setLoader(true);
      console.log("body before api -> ", body);
      const res = await startConversationApi(body);
      if (res.resultCode == 200) {
        dispatch(updateChatList(true));
        setMessage("");
        setChatName("");
        setImageArray([]);
        if (teamObj) {
          navigation.navigate("MessagesMain");
          setLoader(false);
        } else {
          navToChat();
        }
      } else {
        Alert.alert(
          "Error",
          res.message?.message
            ? res.message?.message
            : "Error while sending Message"
        );
      }
    } catch (e) {
      console.log("Error starting converation ", e);
      setLoader(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.headerContainer}>
        <TopHeader
          title="Start Conversation"
          isCross
          noSubmit
          onPress={() => navigation.goBack()}
        />
      </View>
      {!loader ? (
        <View style={{ flex: 1 }}>
          {idArray.length > 1 && !fanObj && (
            <InputChat
              // value={chatName}
              title="Chat Name"
              placeholder={"Enter Chat Name"}
              onChangeText={(text) => setChatName(text)}
              style={{ height: 80 }}
              innerStyle={{
                borderColor: colors.accentGray,
                borderWidth: 0.5,
              }}
            />
          )}
          {!fanObj ? (
            <View style={styles.searchContainer}>
              <Text style={styles.searchText}>Fans</Text>
              <SearchWithTags
                // list={fansList}
                teamList={teamMembersList}
                onItemSelect={(arr) => itemPressed(arr)}
              />
            </View>
          ) : (
            <View style={styles.fanContainer}>
              <View style={styles.fanAvatar}>
                {
                  // fanObj?.avatar?.uri == '' ?
                  <Text style={styles.fanAvatrTxt}>
                    {showInitials(fanObj?.display_name)}
                  </Text>
                  // :
                  // <Image source={{ uri: fanObj?.avatar?.uri }} style={{ borderRadius: getHeightPixel(40) }} />
                }
              </View>
              <Text style={styles.fanName}>
                {fanObj?.display_name.toUpperCase()}
              </Text>
              <Text style={styles.fanAddress}>{fanObj?.locale?.address}</Text>
            </View>
          )}
        </View>
      ) : (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}

      {/* {The Message box section is here} */}
      <KeyboardAvoidingView
        keyboardVerticalOffset={getHeightPixel(60)}
        behavior={Platform.OS == "ios" ? "padding" : "height"}
        style={
          {
            // paddingBottom: Platform.OS == 'android' && isKeyboardVisible ? getHeightPixel(20) : 0
          }
        }
      >
        <MessageComponent
          sendPressed={sendMessagePressed}
          navigation={navigation}
          comment={message}
          setComment={(text) => setMessage(text)}
          fileBottomOpen={() => {
            Keyboard.dismiss()
            fileBottomOpen()
          }}
          list={imageArray}
          updateArray={(item) => {
            setImageArray((pre) => {
              return pre.filter((temp) => temp != item);
            });
          }}
        />
      </KeyboardAvoidingView>
      {/* BOTTOMSHEET FOR SELECTING DOCS, IMAGES AND CAMERA  */}
      <BottomSheet
        index={-1}
        snapPoints={[200, 190]}
        initialSnapIndex={-1}
        enablePanDownToClose={true}
        ref={fileBottomSheetRef}
      >
        <BottomSheetModal
          fileBottomSheetRef={fileBottomSheetRef}
          chooseDocument={chooseDocument}
          chooseCamera={chooseCamera}
          chooseImage={chooseImage}
        />
      </BottomSheet>
    </View>
  );
};

export default StartConversation;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "white",
  },
  headerContainer: {
    borderColor: "#e2e6e9",
    borderWidth: 0.5,
  },
  searchContainer: {
    paddingHorizontal: getWidthPixel(15),
    paddingTop: getHeightPixel(10),
  },
  searchText: {
    fontFamily: "Segoe UI",
    fontSize: getHeightPixel(16),
    marginBottom: getHeightPixel(5),
    fontWeight: "700",
    color: colors.mineShaft,
  },
  fanContainer: {
    flex: 1,
    alignItems: "center",
    paddingVertical: getHeightPixel(20),
  },
  fanAvatar: {
    backgroundColor: colors.primary,
    width: getHeightPixel(80),
    height: getHeightPixel(80),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: getHeightPixel(40),
  },
  fanAvatrTxt: {
    fontSize: getHeightPixel(28),
    fontFamily: "Segoe UI",
    color: "white",
  },
  fanName: {
    fontSize: getHeightPixel(18),
    fontFamily: "Segoe UI",
    color: colors.mineShaft,
    marginTop: getHeightPixel(5),
    fontWeight: "600",
  },
  fanAddress: {
    fontSize: getHeightPixel(14),
    fontFamily: "Segoe UI",
    color: colors.accentGray,
    marginTop: getHeightPixel(5),
    // fontWeight: '600'
  },
});
