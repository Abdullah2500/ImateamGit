import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform,
  Keyboard,
} from "react-native";
// import { TextInput } from 'react-native-gesture-handler'
import { getHeightPixel, getWidthPixel, font } from "../../../../common/helper";
import colors from "../../../../common/colors";
import AttachIcon from "react-native-vector-icons/Entypo";
import { AttachmentListComp } from "./AttachmentListComp";
const MessageComponent = (props) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);
  return (
    <View
      style={
        {
          // maxHeight: 100,
        }
      }
    >
      {props.list?.length > 0 && (
        <View
          style={{
            height: 100,
            backgroundColor: colors.ghostWhite
          }}
        >
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            style={{
              borderTopColor: colors.grayLight,
              borderTopWidth: 1,
            }}
          >
            <AttachmentListComp
              Uri={props.list}
              updateArray={(item) => props.updateArray(item)}
            />
          </ScrollView>
        </View>
      )}
      <View style={styles.content2Wrapper}>
        {/* {The Message box section is here} */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingBottom:
              Platform.OS == "android" && isKeyboardVisible ? 20 : 0,
          }}
        >
          <TouchableOpacity onPress={() => props.fileBottomOpen()}>
            <AttachIcon name="attachment" size={18} color={colors.accentGray} />
          </TouchableOpacity>
          {/* <TouchableOpacity>
                        <AttachIcon
                            name="emoji-happy"
                            size={18}
                            color={colors.accentGray}
                        />
                    </TouchableOpacity> */}
        </View>

        <TextInput
          style={[
            styles.search,
            {
              textAlign: "left",
              flex: 1,
              ...font(14),
              color: colors.gray,
              paddingBottom:
                Platform.OS == "android" && isKeyboardVisible ? 20 : 0,
            },
          ]}
          autoCorrect={false}
          onFocus={props.onFocus}
          onBlur={props.onBlur}
          placeholder="Write a Comment"
          value={props.comment}
          onChangeText={(val) => props.setComment(val)}
          multiline={true}
          numberOfLines={3}
        />
        <TouchableOpacity onPress={props.sendPressed}>
          <Image
            source={require("../../../../common/assets/img/sendIcon.png")}
            style={{
              width: 40,
              height: 40,
              marginBottom:
                Platform.OS == "android" && isKeyboardVisible ? 20 : 0,
            }}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MessageComponent;

const styles = StyleSheet.create({
  search: {
    flex: 1,
    ...font(12, "bold"),
    width: 225,
    paddingVertical: 0,
    textAlign: "center",
    paddingHorizontal: 20,
    color: colors.accentGray,
  },
  content2Wrapper: {
    borderColor: colors.lightGray,
    borderTopWidth: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderColor: colors.ironGray,
    borderTopWidth: 1,
    alignItems: "center",
    // marginBottom: getHeightPixel(10),
    // height: getHeightPixel(70),
  },
});
