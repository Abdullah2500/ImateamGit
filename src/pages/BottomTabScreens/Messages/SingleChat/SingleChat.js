import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  View,
  KeyboardAvoidingView,
  FlatList,
  Platform,
  BackHandler,
  ActivityIndicator,
  Alert,
  Keyboard,
} from "react-native";
import ProfileHeader from "../../../../common/Components/ProfileHeader";
import MessageComponent from "../Components/MessageComponent";
import { getHeightPixel, getWidthPixel } from "../../../../common/helper";
import BottomSheet from "@gorhom/bottom-sheet";
import BottomSheetModal from "../Components/BottomSheetModal";
import colors from "../../../../common/colors";
import IndividualSingleMessage from "./IndividualSingleMessage";
import SingleChatHeader from "./SingleChatHeader";
import RNFS from "react-native-fs";
import DocumentPicker from "react-native-document-picker";
import ImgToBase64 from "react-native-image-base64";
import ImagePicker from "react-native-image-crop-picker";
// import MediaMessage from './MediaMessage'
import { getAllMessages, updateUnreadMsgsApi } from "../API/messagesApi";
import { SingleMessageApi } from "../API/messagesApi";
import { useDispatch, useSelector } from "react-redux";
import { useGetUserQuery } from "../../../../Reducers/usersApi";
import LoadingDots from "react-native-loading-dots";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { updateChatList } from "../../../../Reducers/CommonReducers/chatSlice";

const SingleChat = ({ navigation, route }) => {
  const { data: userInfo, isFetching: fetch } = useGetUserQuery();
  const dispatch = useDispatch();
  const [comment, setComment] = useState("");
  const fileBottomSheetRef = useRef(null);
  const [imageArray, setImageArray] = useState([]);
  const [flag, setFlag] = useState(false);
  const [isMessageSend, setIsMessageSend] = useState(false);
  const [loader, setLoader] = useState(false);
  const [receiverObj, setReceiverObj] = useState(null);
  const [sendFlag, setSendFlag] = useState(false);
  const isLoading = useRef(false);
  const selector = useSelector((selector) => selector);
  // console.log('route.params.obj -> ', route.params?.chatObj)
  const { chatObj } = route.params;
  useLayoutEffect(() => {
    let obj = chatObj.users.find((item) => item.id !== userInfo.id);
    setReceiverObj(obj);
  }, []);
  const [msgList, setMsgList] = useState([]);

  // const countRef = useRef(0)
  // const flatListRef = useRef(null);
  // const isMounted = useRef(false)

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    updateUnreadMsgsFunc();
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );
    // getAllMessagesFunc(true);
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
      // countRef.current = 0
    };
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

  // useEffect(() => {
  //     isMounted.current = true;
  //     return () => { isMounted.current = false }
  // }, []);

  useLayoutEffect(() => {
    getAllMessagesFunc();
  }, [selector.chat.updateChat]);

  const getAllMessagesFunc = async (loader = false) => {
    try {
      console.log("isLoading.current===>", isLoading.current);
      if (isLoading.current) {
        setLoader(false);
        // isLoading.current = false;
      } else {
        setLoader(true);
      }
      const res = await getAllMessages(chatObj?.id);
      // setLoader(false)
      if (res.resultCode == 200) {
        console.log("ChatObj here -> ", JSON.stringify(chatObj));
        // console.log('getAllMessages (singleChat) -> ', JSON.stringify(res))
        console.log("getAllMessages response here");
        let arr = [];
        // res.data.map(item => arr.push(item))
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
      setLoader(false);
    } catch (e) {
      console.log("Error getAllMessages ", e);
    } finally {
      setLoader(false);
      setIsMessageSend(false);
    }
  };

  useEffect(() => {
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
      await RNFS.readFile(img.path, "base64").then((RNFSresponse) => {
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
        await ImgToBase64.getBase64String(img.path)
          .then((base64String) => {
            // console.log("base64String: ", base64String);
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
      image.map(async (item) => {
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
        await convertImageToBase64(imgobj);
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
        await RNFS.readFile(item.uri, "base64").then((RNFSresponse) => {
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
    }).then(async (image) => {
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

      await convertImageToBase64(imgobj);
      //   );
    });
    setTimeout(() => setFlag(!flag), 500);
    // console.log("i am image converted in base 64", Uri.length);
  };

  const sendPressed = async () => {
    if (comment.trim() == "" && imageArray.length == 0) {
      return;
    }
    let body = {};
    body["payload"] = {
      message: comment,
    };
    body["files"] = imageArray;
    setIsMessageSend(true);
    setComment("");
    setImageArray([]);
    try {
      isLoading.current = true;
      console.log("body before api -> ", body);
      const res = await SingleMessageApi(chatObj?.id, body);
      if (res.resultCode == 200) {
        dispatch(updateChatList(true));
        getAllMessagesFunc(false);
        setSendFlag(true);
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
    } finally {
    }
  };

  // const scrollToBottom = () => {
  //     if (flatListRef?.current && isMounted.current && countRef.current > 5) {
  //         setTimeout(() => flatListRef.current.scrollToIndex({ animated: true, index: countRef.current - 1 }), 200)
  //     }
  // }

  return (
    <View style={{ flex: 1 }}>
      <ProfileHeader navigation={navigation} />
      <SingleChatHeader
        title={receiverObj ? receiverObj.display_name : "Anonymous"}
        navigation={navigation}
      />
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
              renderItem={({ item, index }) => (
                <IndividualSingleMessage index={index} obj={item} />
              )}
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
          // onFocus={scrollToBottom}
          list={imageArray}
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
export default SingleChat;
