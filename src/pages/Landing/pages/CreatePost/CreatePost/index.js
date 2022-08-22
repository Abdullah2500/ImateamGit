import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Pressable,
  TextInput,
  Text,
  TouchableWithoutFeedback,
  View,
  Image,
  Keyboard,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
  Platform,
  useWindowDimensions,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import RNFS from "react-native-fs";
import FastImage from "react-native-fast-image";
import Toast from "react-native-toast-message";
import ButtonCommon from "../../../../../common/Components/Buttons";
import DocumentPicker, { types } from "react-native-document-picker";
import ImgToBase64 from "react-native-image-base64";
import ImagePicker, { openCamera } from "react-native-image-crop-picker";
import { Easing } from "react-native-reanimated";
import { RadioButton } from "react-native-paper";
import "react-native-gesture-handler";
import AppStatusBar from "../../../../statusBarColor";
import BottomNavigation from "../../../../../common/Components/BottomNavigation";
import Icon from "react-native-vector-icons/AntDesign";
import AttachIcon from "react-native-vector-icons/Entypo";
import DocumnetIcon from "react-native-vector-icons/Ionicons";
import CameraIcon from "react-native-vector-icons/Feather";
import FullPost from "../../../../../common/Components/Post/FullPost";
import colors from "../../../../../common/colors";
import {
  font,
  getHeightPercentage,
  getHeightPixel,
  getWidthPercentage,
  getWidthPixel,
} from "../../../../../common/helper";
import BottomSheet from "@gorhom/bottom-sheet";
import { Appearance } from "react-native";

import CommonHeader from "../../../../../common/Components/CommonHeader";
import SharedPeoples from "../../../../../common/Components/SharedPeoples";
import { useGetUserQuery } from "../../../../../Reducers/usersApi";
import { createPostAPI } from "../../../Api/createPostAPI";
import { ShowInitialsOfName } from "../../../../../common/Components/ShowInitialsOfName";
import deletePostAPI from "../../../Api/deletePostAPI";
import Loading from "../../../../../common/Components/MainFrame";
import editPostAPI from "../../../Api/editPostAPI";

const CreatePost = ({ navigation, route }) => {
  const { postType } = route?.params;

  // console.log("here data of edit post", post);
  const { height, width } = useWindowDimensions();
  const { data: userInfo, isFetching: fetch } = useGetUserQuery();
  const userId = userInfo?.id;
  const [postText, setPostText] = useState("");
  const [checked, setChecked] = React.useState(
    userInfo?.org_accounts[0].display_name
  );
  const [name, setName] = useState(userInfo?.display_name);
  const [id, setId] = useState(userInfo?.id);
  const [Uri, setUri] = useState([]);
  const [img, setImg] = useState(userInfo?.avatar?.url);
  const [list, setList] = useState([]);
  const [imageArray, setImageArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const colorScheme = Appearance.getColorScheme();
  const [apiLoader, setApiLoader] = useState(false);
  const [orignalAttachments, setOrginalAttachments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [isMediaLoading, setIsMediaLoading] = useState(false)
  //console.log(userInfo);
  const sampleProfile =
    "https://alchinlong.com/wp-content/uploads/2015/09/sample-profile-320x320.png";
  const TouchableWrapper = Platform.OS === "ios" ? KeyboardAvoidingView : View;

  console.log(" i am here", userInfo);

  useEffect(() => {
    console.log("imageArray: ", imageArray);
    console.log("Uri: ", Uri);
  }, [imageArray, Uri]);

  // BOTTOMSHEET FUNCTIONS FOR OPENING AND CLOSING
  const profileBottomSheetRef = useRef(null);
  const fileBottomSheetRef = useRef(null);
  const profileBottomClose = () => {
    profileBottomSheetRef.current.close();
  };
  const profileBottomOpen = () => {
    fileBottomClose();
    profileBottomSheetRef.current.expand();
  };

  const fileBottomClose = () => {
    fileBottomSheetRef.current.close();
  };
  const fileBottomOpen = () => {
    Keyboard.dismiss();
    profileBottomClose();
    if (Uri.length != 8) {
      fileBottomSheetRef.current.expand();
    }
    else {
      Alert.alert("", "Maximum 8 files can be attach.")
    }
  };

  //INSIDE BOTTOMSHEET ITEM'S FUNCTION HANDLER
  const bottomSheetHandler = (name, id, img) => {
    setChecked(name);
    setName(name);
    setId(id);
    setImg(img);

    profileBottomClose();
  };
  // CONVERTING IMAGES TO BASE64 FOR UPLOADING TO
  const convertImageToBase64 = async (img) => {
    console.log("img: ", img);
    if (img.path) {
      ImgToBase64.getBase64String(img.path)
        .then((base64String) => {
          console.log("base64String: ", base64String);
          const temp = base64String;
          const imgobj = {
            data: temp,
            fileInfo: img.fileInfo,
          };

          let temArray = imageArray;
          temArray.push(imgobj);
          //console.log("temArray", temArray);
          setImageArray(temArray);
          //return temp;
        })
        .catch((err) => "not converted");
    }
  };
  //j document picker
  const chooseDocument = async () => {
    fileBottomClose();
    console.log("document picker called");
    try {
      const pickerResult = await DocumentPicker.pick({
        type: DocumentPicker.types.pdf,
        allowMultiSelection: true,
      });
      if (pickerResult.length > 8) {
        alert('Documents length cannot be more than 8')
        return
      }
      setIsMediaLoading(true)
      //  console.log("pickerResult: ", pickerResult);
      pickerResult.map(async (item, index) => {
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
          setUri((prevArray) => [...prevArray, obj]);
          let temArray = imageArray;
          temArray.push(obj);
          //console.log("temArray", temArray);
          setImageArray(temArray);
        });

        // console.log("obj: ", obj);

        // convertImageToBase64(obj);
        if (index == pickerResult.length - 1) setIsMediaLoading(false)
      });
    } catch (error) {
      console.log("error in picking file", error);
    }
  };
  const chooseImage = async () => {
    fileBottomClose();
    await ImagePicker.openPicker({
      width: getWidthPixel(300),
      height: getHeightPixel(400),
      cropping: false,
      multiple: true,
      mediaType: "any",
      useFrontCamera: true,
      compressImageQuality: 0.7,
      smartAlbums: [
        "UserLibrary",
        "PhotoStream",
        "Panoramas",
        "Videos",
        "Bursts",
      ],
    }).then((images) => {
      if (images.length > 8) {
        alert('Images length cannot be more than 8')
        return
      }
      //setUri(image.path);
      let image = []
      console.log("ma image wala hn", image);
      let count = Uri.length
      for (let i = 0; i < images.length; i++) {
        if (count != 8) {
          image.push(images[i])
          count += 1
        }
        else {
          break
        }
      }
      setIsMediaLoading(true)
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
        setUri((prevArray) => [...prevArray, imgobj]);

        convertImageToBase64(imgobj);
        if (index == image.length - 1) setIsMediaLoading(false)
      });
    });
    // console.log("i am image converted in base 64", Uri);
  };
  const openCam = async () => {
    fileBottomClose();
    await ImagePicker.openCamera({
      width: getWidthPixel(300),
      height: getHeightPixel(400),
      compressImageQuality: 0.7,
      //  cropping: true,
      multiple: true,
      mediaType: "photo",
      // useFrontCamera: true,
    }).then((image) => {
      //setUri(image.path);
      console.log("ma image wala hn", image);

      const imageName = new Date();

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
      setUri((prevArray) => [...prevArray, imgobj]);

      convertImageToBase64(imgobj);
      //   );
    });
    console.log("i am image converted in base 64", Uri.length);
  };

  const setAttachmentsofList = async () => {
    if (route?.params?.postType == "editPost") {
      setApiLoader(true);
      setName(route?.params?.post?.user_info?.display_name);
      setChecked(route?.params?.post?.user_info?.display_name);
      setPostText(
        route?.params?.post?.payload.hasOwnProperty("repostInfo")
          ? route?.params?.post?.payload?.comment
          : route?.params?.post?.payload?.text
      );
      setOrginalAttachments(
        route?.params?.post?.attachments.map((item) => {
          return {
            fileInfo: {
              attachmentId: item?.id,
              filename: item?.payload?.filename,
              fileSize: item?.payload?.fileSize,
              fileType: item?.payload?.fileType,
            },
            data: null,
          };
        })
      );

      console.log("post data here", route?.params);

      if (route?.params?.post?.attachments) {
        await route?.params?.post?.attachments.map((img) => {
          const imgobj = {
            path: img.upload,
            fileInfo: { ...img.payload, attachmentId: img?.id },
          };
          setUri((prevArray) => [...prevArray, imgobj]);

          console.log("postedit attachments", Uri);

          let temArray = imageArray;
          temArray.push(imgobj);
          setImageArray(temArray);

          // convertImageToBase64(imgobj);
        });
      }

      setApiLoader(false);

      // setApiLoader(false);
    } else if (route?.params?.postType == "editComment") {
      console.log("edit comment here ");
    }
  };

  useEffect(() => {
    if (route.params?.nameList) {
      setList(route.params?.nameList);
      console.log(route.params?.nameList);
      console.log("post text is ", route?.params?.post?.payload?.text);
    }

    setAttachmentsofList();
  }, [route.params?.nameList]);

  const onPressPostCall = async () => {
    if (postText.trim().length === 0) {
      showToastEmptyText();
    } else {
      setLoading(true);
      Keyboard.dismiss();

      console.log("new iamge array", imageArray);

      const sendToArray = list.map((item) => {
        return {
          id: item.id,
          display_name: item.display_info.display_name,
        };
      });
      const body = {
        values: {
          accountId: id,
          text: postText,
          private: false,
          burn: false,
        },
        files: imageArray,
        feeds: sendToArray,
      };

      console.log(
        "here is body",
        body.values,
        body.files.length,
        body.feeds.length
      );

      const res = await createPostAPI(body);
      if (res?.data) {
        setLoading(false);

        navigation.navigate({
          name: "MainLanding",
          params: {
            deletedPostId: res?.data?.id,
            type: "postCreated",
          },
        });
      } else {
        setLoading(false);
      }
    }
  };

  const deletePost = async () => {
    setApiLoader(true);
    const response = await deletePostAPI(route?.params?.post?.id);
    if (response) {
      console.log("post deleted", response);
      setApiLoader(false);
      showToast();

      navigation.navigate({
        name: "MainLanding",
        params: {
          deletedPostId: route?.params?.post?.id,
          type: "postDeleted",
        },
      });
    }
  };
  const showDeleteAlert = () => {
    Alert.alert(
      "Confirm delete",
      "Are you sure? You can't undo this action afterwards.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Delete"),
          style: "cancel",
        },
        { text: "Delete", onPress: () => deletePost() },
      ]
    );
  };

  const editPost = async () => {
    setLoading(true);
    const bodyOwnPost = {
      postId: route?.params?.id,
      values: {
        accountId: route?.params?.user_id,
        text: postText,
        private: false,
        burn: false,
        feeds: route?.params?.post?.payload?.feeds,
        //  repostInfo: route?.params?.post?.payload?.repostInfo,
      },
      files: imageArray,
    };

    const newBodyForRshare = {
      postId: route?.params?.post?.id,
      values: {
        accountId: route?.params?.user_id,
        text: route?.params?.post?.payload?.text,
        comment: postText,
        private: false,
        burn: false,
        feeds: [],
        repostInfo: {
          id: route?.params?.post?.payload?.repostInfo?.id,
          display_name: route?.params?.post?.payload?.repostInfo?.display_name,
          avatar: route?.params?.post?.payload?.repostInfo?.avatar,
          groups: route?.params?.post?.payload?.repostInfo?.groups,
          locale: route?.params?.post?.payload?.repostInfo?.locale,
          organization: route?.params?.post?.payload?.repostInfo?.organization,
        },
      },
      files: orignalAttachments,
    };

    const response = await editPostAPI(
      route?.params?.post?.payload.hasOwnProperty("repostInfo")
        ? newBodyForRshare
        : bodyOwnPost
    );
    if (response) {
      setLoading(false);
      showToastonEditPost();

      navigation.navigate({
        name: "MainLanding",
        params: {
          deletedPostId: response?.updated_at + 1,
          type: "postCreated",
        },
      });
    } else {
      console.log("post not edited");
      setLoading(false);
    }
  };
  const showToast = () => {
    Toast.show({
      type: "info",
      text2: `Post sucessfully deleted`,
      visibilityTime: 1500,
    });
  };

  const showToastEmptyText = () => {
    Toast.show({
      type: "error",
      text2: `Post text is empty`,
      visibilityTime: 1500,
    });
  };
  const showToastonEditPost = () => {
    Toast.show({
      type: "info",
      text2: `Post edited successfully`,
      visibilityTime: 1500,
    });
  };
  return (
    <View style={styles.container}>
      <Loading isLoading={loading} />
      {/* CREATE POST HEADER */}
      <SafeAreaView style={{ backgroundColor: "#fff" }}>
        <AppStatusBar backgroundColor="#fff" barStyle="dark-content" />
        <CommonHeader
          navigation={navigation}
          centerText={
            route?.params?.postType === "editPost" ? "EDIT POST" : "NEW POST"
          }
          endText="POST"
          // onDone={setDone}
          onPressPost={
            route.params.postType == "editPost" ? editPost : onPressPostCall
          }
          isNewPost={true}
        />
      </SafeAreaView>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        {/* BODY  */}
        <View style={styles.contentWrapper}>
          {/* CONTENT 1 CONTAINING PROFILE IMAGE AND NAME DROPDOWN */}
          <View style={styles.content1}>
            <Pressable onPress={() => console.log(name)}>
              <ShowInitialsOfName
                size={40}
                radius={20}
                fontSize={18}
                name={name}
                colors={colors.primary}
                imgUrl={img}
                userId={userInfo?.id}
              />
            </Pressable>
            <TouchableOpacity
              onPress={
                route?.params?.postType == "editPost" ? null : profileBottomOpen
              }
            >
              <View style={styles.nameWrapper}>
                <Text style={styles.nameText}>{name}</Text>
                <Icon name="caretdown" size={11} color={colors.mineShaft} />
              </View>
            </TouchableOpacity>
          </View>
          {/* CONTENT 2 CONTAINING TEXTINPUT FOR POST DESCRIPTION */}
          <View style={styles.content2}>
            <TextInput
              style={{
                ...styles.postDescription,
                color:
                  colorScheme === "dark" ? colors.black : colors.accentGray,
              }}
              multiline={true}
              placeholder="Write Something..."
              placeholderTextColor={
                colorScheme === "dark" ? colors.black : colors.accentGray
              }
              underlineColor="transparent"
              value={postText}
              onChangeText={(postText) => setPostText(postText)}
            ></TextInput>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {/* CONTENT 3 FOR ATTACH FILES AND POST TO */}

      {postType !== "editPost" ? (
        <View style={{ marginHorizontal: 20, marginBottom: 5 }}>
          {list.length != 0 ? (
            <View style={{ backgroundColor: colors.silverWhite }}>
              <SharedPeoples
                profiles={postType !== "editPost" ? list : nameList}
              />
            </View>
          ) : null}
        </View>
      ) : null}

      <TouchableWrapper behavior="padding" style={styles.content3}>
        {Uri.length != 0 ? (
          <View
            style={{
              alignItems: "flex-start",
              flex: 1,
              paddingVertical: 10,
              overflow: "hidden",
              flexDirection: "row",
              flexWrap: "wrap",
            }}
          >
            {
              isMediaLoading &&
              <View style={{
                backgroundColor: "rgba(0,0,0,0.3)",
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1
              }}>
                <ActivityIndicator color='white' size='small' />
              </View>
            }
            {Uri.map((item, index) => (
              <View
                key={index}
                style={{
                  marginHorizontal: getWidthPixel(5),
                  marginVertical: getHeightPixel(5),
                }}
              >
                {
                  (console.log("i am file type", item.fileInfo.fileType),
                    item.fileInfo.fileType === "video/mp4" ? (
                      <>
                        <View
                          style={{
                            width: getWidthPixel(60),
                            height: getHeightPixel(60),
                            backgroundColor: "#fff",
                            resizeMode: "cover",
                            borderWidth: 1,
                            borderColor: colors.inputBlue,
                            marginRight: 2,
                          }}
                          onPress={() => {
                            setImageArray((pre) => {
                              let tempArr = [...pre];
                              tempArr = tempArr.filter(
                                (img) =>
                                  img.fileInfo?.attachmentId !==
                                  item?.fileInfo?.attachmentId
                              );
                              return tempArr;
                            });

                            setUri((pre) => {
                              return pre.filter((temp) => temp != item);
                            });
                          }}
                        // onPress={() => setUri(Uri.slice(index + 1))}
                        />
                        <Icon
                          name="play"
                          size={22}
                          color={colors.primary}
                          onPress={() => {
                            setImageArray((pre) => {
                              let tempArr = [...pre];
                              tempArr = tempArr.filter(
                                (img) =>
                                  img.fileInfo?.attachmentId !==
                                  item?.fileInfo?.attachmentId
                              );
                              return tempArr;
                            });

                            setUri((pre) => {
                              return pre.filter((temp) => temp != item);
                            });
                          }}
                          // onPress={() => setUri(Uri.slice(index + 1))}
                          style={{
                            position: "absolute",
                            right: getWidthPixel(20),
                            left: getWidthPixel(20),
                            bottom: 20,
                          }}
                        />
                      </>
                    ) : item.fileInfo.fileType === "application/pdf" ? (
                      <>
                        <View
                          style={{
                            width: getWidthPixel(60),
                            height: getHeightPixel(60),
                            backgroundColor: "#fff",
                            resizeMode: "cover",
                            borderWidth: 1,
                            borderColor: colors.inputBlue,
                            marginRight: 2,
                          }}
                          onPress={() => {
                            setImageArray((pre) => {
                              let tempArr = [...pre];
                              tempArr = tempArr.filter(
                                (img) =>
                                  img.fileInfo?.attachmentId !==
                                  item?.fileInfo?.attachmentId
                              );
                              return tempArr;
                            });
                            setUri((pre) => {
                              return pre.filter((temp) => {
                                temp != item;
                              });
                            });
                          }}
                        // onPress={() => setUri(Uri.slice(index + 1))}
                        />
                        <Icon
                          name="file1"
                          size={22}
                          color={colors.primary}
                          onPress={() => {
                            setImageArray((pre) => {
                              let tempArr = [...pre];
                              tempArr = tempArr.filter(
                                (img) =>
                                  img.fileInfo?.attachmentId !==
                                  item?.fileInfo?.attachmentId
                              );
                              return tempArr;
                            });

                            setUri((pre) => {
                              return pre.filter((temp) => temp != item);
                            });
                          }}
                          // onPress={() => setUri(Uri.slice(index + 1))}
                          style={{
                            position: "absolute",
                            right: getWidthPixel(20),
                            left: getWidthPixel(20),
                            bottom: 20,
                          }}
                        />
                      </>
                    ) : (
                      <TouchableOpacity
                        onPress={() => {
                          setModalVisible(true);
                          setModalImage(item);
                        }}
                      >
                        <FastImage
                          style={{
                            width: 60,
                            height: 60,
                            backgroundColor: "red",
                            resizeMode: "cover",
                            borderWidth: 1,
                            borderColor: colors.inputBlue,
                            marginRight: 2,
                          }}
                          source={{
                            uri: item.path,
                            priority: FastImage.priority.high,
                          }}
                        >
                          <View
                            style={{
                              flex: 1,
                              backgroundColor: "rgba(255, 255, 255, 0.3)",
                            }}
                          />
                        </FastImage>
                      </TouchableOpacity>
                    ))
                }
                <View
                  style={{
                    position: "absolute",
                    right: -7.5,
                    top: -7.5,
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: colors.primary,
                  }}
                >
                  <Icon
                    name="close"
                    size={18}
                    color="white"
                    onPress={() => {
                      setImageArray((pre) => {
                        let tempArr = [...pre];
                        tempArr = tempArr.filter(
                          (img) =>
                            img.fileInfo?.attachmentId !==
                            item?.fileInfo?.attachmentId
                        );
                        return tempArr;
                      });

                      setUri((pre) => {
                        return pre.filter((temp) => temp != item);
                      });
                    }}
                  // onPress={() => setUri(Uri.slice(index + 1))}
                  />
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {route?.params?.postType == "editPost" ? (
          <View style={styles.deleteButton}>
            <ButtonCommon
              title={"DELETE POST"}
              textColor={colors.ghostWhite}
              color={colors.accentGray}
              loading={loading}
              method={() => {
                // deletePost();
                showDeleteAlert();
              }}
            />
          </View>
        ) : null}

        <View style={styles.content3Wrapper}>
          <TouchableOpacity onPress={fileBottomOpen} style={{ flex: 1 }}>
            <AttachIcon name="attachment" size={15} color={colors.accentGray} />
          </TouchableOpacity>

          {postType !== "editPost" ? (
            <>
              <TouchableOpacity>
                <Icon name="link" size={18} color={colors.accentGray} />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("SharedTo", {
                    userId,
                    interests: userInfo?.interests,
                    selectedSendToList: list,
                  });
                  console.log(" iam userINfo");
                  Keyboard.dismiss();
                  fileBottomClose();
                }}
              >
                <Text
                  style={{
                    ...font(14),
                    color: colors.mineShaft,
                    marginLeft: 6,
                  }}
                >
                  Post To
                </Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </TouchableWrapper>

      {/* BOTTOM NAVIGATION COMPONENT */}
      {/* <View style={styles.navigation}>
        <BottomNavigation navigation={navigation} />
      </View> */}
      {/* FIRST BOTTOM SHEET FOR SELECTING PROFILE PREFERENCES */}
      <BottomSheet
        index={-1}
        ref={profileBottomSheetRef}
        snapPoints={[260, 250]}
        initialSnapIndex={-1}
        enablePanDownToClose={true}
        animationConfigs={{
          duration: 550,
          easing: Easing.exp,
        }}
      >
        {/* NEEDS TO WORK TO SWITCH BETWEEN THE ACCOUNTS IF THERE IS MORE THAN ONE ACCOUNT */}
        <View style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetHeader}>
            <Text style={{ paddingBottom: 11, ...font(14, "bold") }}>
              Posting as
            </Text>
          </View>
          {/* MAP FUNCTION MAY USE */}

          <ScrollView showsVerticalScrollIndicator={false}>
            {userInfo?.org_accounts.map((item, key) => (
              <TouchableOpacity
                key={key.toString()}
                onPress={() =>
                  bottomSheetHandler(
                    item?.display_name,
                    item?.id,
                    item?.avatar?.url
                  )
                }
              >
                <View
                  style={[
                    styles.bottomSheetItem,
                    {
                      backgroundColor:
                        checked === item.display_name
                          ? colors.lightBlue
                          : "#fff",
                    },
                  ]}
                >
                  <RadioButton
                    value="first"
                    color={colors.inputBlue}
                    status={
                      checked === item.display_name ? "checked" : "unchecked"
                    }
                  />
                  <Text style={styles.bottomSheetName}>
                    {item.display_name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </BottomSheet>

      {/* SECOND BOTTOM SHEET FOR SELECTING FILES I.E IMAGE, DOCS  */}
      <BottomSheet
        index={-1}
        snapPoints={[200, 190]}
        initialSnapIndex={-1}
        enablePanDownToClose={true}
        ref={fileBottomSheetRef}
      >
        <View style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetHeader}>
            <Text
              style={{
                paddingBottom: 11,
                ...font(14, "bold"),
                color: colors.mineShaft,
              }}
            >
              Choose Attached File
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <View>
              <TouchableOpacity style={styles.bottomSheetIconsWrapper}>
                <DocumnetIcon
                  name="document-text-outline"
                  size={23}
                  style={{
                    padding: 20,
                    color: "#fff",
                    flexDirection: "column",
                    alignSelf: "center",
                  }}
                  onPress={chooseDocument}
                />
              </TouchableOpacity>
              <Text style={{ color: "black" }}>Document</Text>
            </View>
            <View
              style={{
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                onPress={chooseImage}
                style={styles.bottomSheetIconsWrapper}
              >
                <AttachIcon
                  name="images"
                  size={23}
                  style={{
                    padding: 20,
                    color: "#fff",
                    flexDirection: "column",
                    alignSelf: "center",
                  }}
                />
              </TouchableOpacity>

              <Text style={{ color: "black" }}>Gallery</Text>
            </View>
            <View
              style={{
                alignItems: "center",
              }}
            >
              <TouchableOpacity style={styles.bottomSheetIconsWrapper}>
                <CameraIcon
                  name="camera"
                  size={23}
                  style={{
                    padding: 20,
                    color: "#fff",
                    flexDirection: "column",
                    alignSelf: "center",
                  }}
                  onPress={openCam}
                />
              </TouchableOpacity>
              <Text style={{ color: "black" }}>Camera</Text>
            </View>
          </View>
        </View>
      </BottomSheet>

      <Modal
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => {
          //  Alert.alert("Modal has been closed.");
          setModalVisible(!modalVisible);
        }}
      >
        {/* SHOW MODAL VISIBILY AND SEND post PROP */}
        <View style={styles.FullImage}>
          <SafeAreaView style={styles.headerWrapper}>
            <View style={{ paddingRight: getWidthPixel(20) }}>
              <Icon
                name="close"
                size={30}
                color={colors.white}
                onPress={() => {
                  setModalVisible(false);
                  setModalImage("");
                }}
              />
            </View>
          </SafeAreaView>

          <FastImage
            source={{
              uri: modalImage?.path,
              priority: FastImage.priority.high,
            }}
            style={{
              width: "100%",
              height: getHeightPercentage(90),
            }}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingHorizontal: 14,
    justifyContent: "space-between",
    alignItems: "center",
    height: 56,
  },
  newPost: {
    paddingVertical: 10,
    ...font(18, "600"),
    color: colors.mineShaft,
  },
  post: {
    ...font(16, "700"),
    color: colors.inputBlue,
  },
  contentWrapper: {
    flex: 2,
    // backgroundColor: "red",
    marginHorizontal: 16,
  },
  content1: {
    flexDirection: "row",
    // backgroundColor: "pink",
    alignItems: "center",
    borderColor: colors.ironGray,
    borderTopWidth: 1,
    paddingTop: getHeightPixel(4),
  },

  profileImage: {
    width: getWidthPixel(40),
    height: getHeightPixel(40),

    marginVertical: 12,
    borderRadius: 20,
    //resizeMode: "contain",
  },
  nameWrapper: {
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft: 13,
    flexDirection: "row",
    backgroundColor: colors.lightGray,
    height: 24,
    minWidth: 100,
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  nameText: {
    ...font(14, "bold"),
    paddingBottom: 2,
    marginRight: 5,
    color: colors.mineShaft,
  },

  content2: {
    flex: 1,
    // backgroundColor: "red",
  },
  postDescription: {
    width: "100%",
    textAlign: "left",
    backgroundColor: "#fff",
    ...font(16, "400"),
    lineHeight: 21.28,
    padding: 3,
  },

  content3: {
    flex: 1.1,
    // backgroundColor: "orange",
    justifyContent: "flex-end",
  },
  content3Wrapper: {
    borderColor: colors.lightGray,
    borderTopWidth: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderColor: colors.ironGray,
    // borderTopWidth: 1,
  },
  FullImage: {
    backgroundColor: colors.black,
    paddingBottom: 0,
    marginBottom: 0,
    height: "100%",
  },
  navigation: {
    // flex: 0.2,
    justifyContent: "center",
    backgroundColor: "black",
    paddingHorizontal: 5,
  },
  bottomSheetContainer: {
    paddingHorizontal: getWidthPixel(50),
    flex: 1,
  },
  bottomSheetHeader: {
    borderBottomColor: colors.lightSilver,
    borderBottomWidth: 1,
    marginBottom: 25,
  },
  bottomSheetItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingVertical: 9,
    borderRadius: 30,
    borderColor: colors.lightSilver,
    borderWidth: 1,
  },
  bottomSheetName: {
    ...font(14, "bold"),
  },
  bottomSheetIconsWrapper: {
    backgroundColor: colors.inputBlue,
    borderRadius: 60,
    justifyContent: "center",
    flexDirection: "column",
    marginBottom: getHeightPixel(6),
  },
  deleteButton: {
    width: getWidthPercentage(80),
    paddingBottom: getHeightPixel(10),

    alignSelf: "center",
  },
  headerWrapper: {
    flexDirection: "row-reverse",
  },
});

export default CreatePost;
