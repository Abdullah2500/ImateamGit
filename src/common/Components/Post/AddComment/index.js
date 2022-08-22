import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import styles from "./styles";
import addComment from "../../../../Reducers/addCommentApi";
import colors from "../../../colors";
import AttachIcon from "react-native-vector-icons/Entypo";
import { convertImageToBase64, getHeightPixel } from "../../../helper";
import { ShowInitialsOfName } from "../../ShowInitialsOfName";
import { useAddNewPostMutation } from "../../../../Reducers/postsApi";
import { AttachmentList } from "../AttachmentsList";
import Loading from "../../MainFrame";
import addReplyOnComment from "../../../../pages/Landing/Api/addReplyToComment";
import { AttachmentListComp } from "../../../../pages/BottomTabScreens/Messages/Components/AttachmentListComp";

function AddComment(props) {
  const {
    post,
    inputRef,
    method,
    onAddComment,
    userId,
    showAttachmentPicker,
    attachmentShown,
    pickerData,
    clearPickerData,
    commentType,
    isMediaLoading
    //  setLoading,
  } = props;
  const [val, setVal] = useState("");
  const [Uri, setUri] = useState([]);
  const [checkCom, setCheckCom] = useState(true);
  const [newComment, { isLoading }] = useAddNewPostMutation();
  const [loading, setLoading] = useState(false);

  const keyboardVerticalOffset = Platform.OS === "ios" ? 0 : 0;

  useEffect(() => {
    setUri([]);
    setUri(pickerData);
    console.log("i am comment type ", commentType);
  }, [pickerData.length]);

  const jsonBody = {
    files: Uri,
    values: {
      accountId: userId,
      burn: post.payload.burn,
      private: post.payload.private,
      text: val,
    },
  };

  function checkEmpty() {
    if (val.length === 0) {
      setCheckCom(false);
    } else {
      setCheckCom(true);
      Keyboard.dismiss();
      postComment();
      newComment(jsonBody, post.id);
    }
  }

  const postComment = async () => {
    setLoading(true);

    const attachments = [];

    post.attachments.map((attachment) => {
      let base64Image = convertImageToBase64(attachment.url);
      attachments.push({
        fileInfo: {
          filename: attachment?.payload.filename,
          fileSize: attachment?.payload.fileSize,
          fileType: attachment?.payload.fileType,
        },
        data: base64Image,
      });
    });

    console.log("i am comment type", commentType);
    if (commentType.type === "reply") {
      var response = await addReplyOnComment(jsonBody, commentType.id);
      console.log("i am reply reponse", response);
    } else {
      var response = await addComment(jsonBody, post.id);
      console.log("i am comment response", response);
    }
    if (response) {
      setVal("");
      setLoading(false);
      setUri([]);
      console.log("i am comment response");
      onAddComment();
    }
    setLoading(false);
  };

  const toggleAttachments = () => {
    showAttachmentPicker(!attachmentShown);
  };
  return (
    <View>
      <Loading isLoading={loading} backgroundColor={colors.white} />
      <View style={styles.container}>
        <View style={styles.wrapper}>
          <TouchableOpacity>
            <ShowInitialsOfName
              size={28}
              radius={20}
              fontSize={10}
              name={post.user_info.display_name}
              colors={colors.accentGray}
              imgUrl={post?.user_info?.avatar?.url}
            />
          </TouchableOpacity>
          <View>
            <TextInput
              placeholder={checkCom ? "Write a comment..." : "Empty Comment"}
              placeholderTextColor={
                checkCom ? colors.lightSilver : colors.blockRed
              }
              value={val}
              style={{ ...styles.input, height: getHeightPixel(50) }}
              onChangeText={(val) => {
                setVal(val);
              }}
              returnKeyLabel="Post"
              returnKeyType="done"
              onSubmitEditing={checkEmpty}
              ref={inputRef}
            />

          </View>
        </View>

        <TouchableOpacity onPress={() => toggleAttachments()}>
          <AttachIcon name="attachment" size={16} color={colors.accentGray} />
        </TouchableOpacity>
      </View>
      {
        (Uri.length > 0 || isMediaLoading) &&
        <View style={{
          height: 100,
          borderTopColor: colors.grayLight,
          borderTopWidth: 1,
          borderBottomColor: colors.grayLight,
          borderBottomWidth: 1,
          paddingBottom: Platform.OS == 'ios' ? getHeightPixel(20) : 0
        }}>
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
          <ScrollView
            horizontal={true}
            showsHorizontalScrollIndicator={false}
          >
            <AttachmentListComp
              Uri={Uri}
              updateArray={(item) => clearPickerData((pre) => {
                return pre.filter((temp) => temp.fileInfo.filename != item.fileInfo.filename);
              })}
            />
          </ScrollView>
        </View>
      }
    </View>
  );
}

export default AddComment;
