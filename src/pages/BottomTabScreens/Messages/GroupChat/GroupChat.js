import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  View,
  KeyboardAvoidingView,
  FlatList,
  Platform,
  BackHandler,
  Alert,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import ProfileHeader from "../../../../common/Components/ProfileHeader";
import MessageComponent from "../Components/MessageComponent";
import { getHeightPixel, getWidthPixel, font } from "../../../../common/helper";
import BottomSheet from "@gorhom/bottom-sheet";
import BottomSheetModal from "../Components/BottomSheetModal";
import GroupHeader from "./components/GroupHeader";
import colors from "../../../../common/colors";
import RNFS from "react-native-fs";
import DocumentPicker, { types } from "react-native-document-picker";
import ImgToBase64 from "react-native-image-base64";
import ImagePicker, { openCamera } from "react-native-image-crop-picker";
import IndividualSingleMessage from "../SingleChat/IndividualSingleMessage";
import {
  getAllMessages,
  SingleMessageApi,
  updateUnreadMsgsApi,
} from "../API/messagesApi";
import { useDispatch, useSelector } from "react-redux";
import LoadingDots from "react-native-loading-dots";
import { useGetUserQuery } from "../../../../Reducers/usersApi";
import { updateChatList } from "../../../../Reducers/CommonReducers/chatSlice";

const GroupChat = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const [comment, setComment] = useState("");
  const fileBottomSheetRef = useRef(null);
  const [imageArray, setImageArray] = useState([]);
  const [flag, setFlag] = useState(false);
  const [msgList, setMsgList] = useState([]);
  const [loader, setLoader] = useState(false);
  const [isMessageSend, setIsMessageSend] = useState(false);
  const [sendFlag, setSendFlag] = useState(false);
  const isLoading = useRef(false);
  const selector = useSelector((selector) => selector);

  const { chatObj } = route.params;

  const { data: userInfo, isFetching: fetch } = useGetUserQuery();

  // console.log('chat obj -> ', chatObj)

  // const flatListRef = useRef();
  // const countRef = useRef(0)
  // const isMounted = useRef(false)

  useEffect(() => {
    getAllMessagesFunc(true);
  }, []);

  useLayoutEffect(() => {
    getAllMessagesFunc();
  }, [selector.chat.updateChat]);

  const getAllMessagesFunc = async (loader = false) => {
    try {
      if (isLoading.current) {
        setLoader(false);
        // isLoading.current = false;
      } else {
        setLoader(true);
      }
      const res = await getAllMessages(route.params?.chatObj?.id);
      setLoader(false);
      if (res.resultCode == 200) {
        // console.log('getAllMessages -> ', JSON.stringify(res))
        console.log("Group Chat getMessages response here");
        // let arr = []
        // res.data.map(item => arr.push(item))
        // setMsgList(arr)
        setMsgList([...res.data.reverse()]);
        // countRef.current = arr.length
        // if (arr.length > 0) {
        //     scrollToBottom()
        // }
      } else {
        Alert.alert(
          "Error",
          res.message?.message
            ? res.message?.message
            : "Error while getting Chat Messages"
        );
      }
    } catch (e) {
      console.log("Error getAllMessages ", e);
    } finally {
      setLoader(false);
      setIsMessageSend(false);
    }
  };

  // useEffect(() => {
  //     isMounted.current = true;
  //     return () => { isMounted.current = false }
  // }, []);

  useEffect(() => {
    updateUnreadMsgsFunc();
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, []);

  const updateUnreadMsgsFunc = async () => {
    let body = {
      roomId: chatObj.id,
      payload: { [userInfo?.id]: { lastSeen: "now" } },
    };
    try {
      const res = await updateUnreadMsgsApi(body);
      if (res.resultCode == 200) {
        // console.log('updateUnreadMsgs -> ', JSON.stringify(res))
        console.log("Group Chat updateUnreadMsgs response here");
      } else {
        Alert.alert(
          "Error",
          res.message?.message
            ? res.message?.message
            : "Error while updating unread messages"
        );
      }
    } catch (e) {
      console.log("Error updating unread messages ", e);
    }
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
      if (image.length > 8) {
        alert('Total images length should be less than 8')
        return;
      }
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
      if (pickerResult.length > 8) {
        alert('Total documents length should be less than 8')
        return;
      }
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

  const sendPressed = async () => {
    if (comment.trim() == "" && imageArray.length == 0) {
      return;
    }
    setComment("");
    setImageArray([]);
    setIsMessageSend(true);
    let body = {};
    body["payload"] = {
      message: comment,
    };
    body["files"] = imageArray;
    try {
      isLoading.current = true;
      console.log("body before api -> ", body);
      const res = await SingleMessageApi(chatObj?.id, body);
      if (res.resultCode == 200) {
        dispatch(updateChatList(true));
        getAllMessagesFunc(false);
        setSendFlag(true);
        console.log("Send pressed response -> ", JSON.stringify(res));
      } else {
        Alert.alert(
          "Error",
          res.message?.message
            ? res.message?.message
            : "Error while sending Message"
        );
      }
    } catch (e) {
      console.log("Error sending message ", e);
      setIsMessageSend(false);
    }
  };

  // const scrollToBottom = () => {
  //     if (flatListRef && isMounted.current && countRef.current > 5) {
  //         setTimeout(() => flatListRef?.current.scrollToIndex({ animated: true, index: countRef.current - 1 }), 100)
  //     }
  // }

  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <ProfileHeader navigation={navigation} />
      <GroupHeader
        title={
          chatObj.name !== "" ? chatObj.name : chatObj.users[0]?.display_name
        }
        chatObj={chatObj}
        navigation={navigation}
      />
      {/* {Main Chat here} */}
      {!loader ? (
        <View style={{ flex: 1 }}>
          {msgList.length > 0 && (
            <FlatList
              style={{
                backgroundColor: colors.ghostWhite,
                paddingHorizontal: getWidthPixel(15),
              }}
              inverted
              // ref={flatListRef}
              // initialNumToRender={100}
              // onScrollToIndexFailed={(e) => console.log('scroll failed ', e)}
              // onContentSizeChange={() => sendFlag && scrollToBottom()}
              data={msgList}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => <IndividualSingleMessage obj={item} />}
            />
          )}
          {isMessageSend && (
            <View
              style={{
                position: "absolute",
                height: 100,
                justifyContent: "center",
                alignItems: "center",
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              <LoadingDots />
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
      <KeyboardAvoidingView
        keyboardVerticalOffset={Platform.select({
          ios: getHeightPixel(25),
          android: 0,
        })}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      >
        <MessageComponent
          comment={comment}
          setComment={(text) => setComment(text)}
          fileBottomOpen={() => {
            Keyboard.dismiss()
            fileBottomOpen()
          }}
          list={imageArray}
          // onFocus={scrollToBottom}
          updateArray={(item) => {
            setImageArray((pre) => {
              return pre.filter((temp) => temp != item);
            });
          }}
          sendPressed={sendPressed}
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
export default GroupChat;
