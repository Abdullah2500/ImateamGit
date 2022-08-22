import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from "react-native";
import RNFS from "react-native-fs";
import DocumentPicker, { types } from "react-native-document-picker";
import ImgToBase64 from "react-native-image-base64";
import ImagePicker, { openCamera } from "react-native-image-crop-picker";
import "react-native-gesture-handler";
import AttachIcon from "react-native-vector-icons/Entypo";
import DocumnetIcon from "react-native-vector-icons/Ionicons";
import CameraIcon from "react-native-vector-icons/Feather";
import colors from "../../colors";
import { font, getHeightPixel, getWidthPixel } from "../../helper";
import BottomSheet from "@gorhom/bottom-sheet";

const MediaPicker = (props) => {
  const { flag, getPickerData, showAttachmentPicker, setIsMediaLoading } = props;
  const [imageArray, setImageArray] = useState([]);
  // BOTTOMSHEET FUNCTIONS FOR OPENING AND CLOSING

  const fileBottomSheetRef = useRef();

  const fileBottomClose = () => {
    fileBottomSheetRef.current.close();
  };
  const fileBottomOpen = () => {
    fileBottomSheetRef.current.expand();
  };
  // CONVERTING IMAGES TO BASE64 FOR UPLOADING TO DB
  const convertImageToBase64 = async (img) => {
    console.log("img: ", img);
    if (img.path) {
      await ImgToBase64.getBase64String(img.path)
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
          //console.log("temArray", temArray);
          setImageArray(temArray);
          getPickerData(imageArray);
          setImageArray([]);

          console.log(" images array", imageArray);
          //return temp;
        })
        .catch((err) => console.log("not converted", err))
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
        alert('Total documents length should be less than 8')
        return;
      }
      setIsMediaLoading(true)
      //  console.log("pickerResult: ", pickerResult);
      pickerResult.map(async (item, index) => {
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
          getPickerData(imageArray);
          setImageArray(temArray);
        });
        if (index == pickerResult.length - 1) setIsMediaLoading(false)
      });
    } catch (error) {
      console.log("error in picking file", error);
      setIsMediaLoading(false)
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
      try {
        setIsMediaLoading(true)
        image.map(async (item, index) => {
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
          await convertImageToBase64(imgobj);
          if (index == image.length - 1) setIsMediaLoading(false)
        })
      } catch (e) {
        console.log('Error while converting images ', e)
      }
    });
    // console.log("i am image converted in base 64", Uri);
  };
  const openCam = async () => {
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
      console.log("Image from camera: ", image);

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
    console.log("i am image converted in base 64", Uri.length);
  };

  useEffect(() => {
    console.log("picker state is ", flag);
    if (flag) {
      fileBottomSheetRef.current.expand();
    } else {
      fileBottomSheetRef.current.close();
    }
  }, [flag]);

  return (
    <BottomSheet
      index={-1}
      snapPoints={[300, 190]}
      initialSnapIndex={-1}
      enablePanDownToClose={true}
      ref={fileBottomSheetRef}
      onChange={(index) => {
        console.log("i am working", index);
        showAttachmentPicker(false);
      }}
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
});

export default MediaPicker;
