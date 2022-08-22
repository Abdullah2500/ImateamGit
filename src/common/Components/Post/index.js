import React, { memo, useState, useEffect, useRef } from "react";
import { Text, View, Modal, Alert } from "react-native";
import GestureRecognizer from "react-native-swipe-gestures";
import { Appearance } from "react-native";
import colors from "../../colors";
import { useGetUserQuery } from "../../../Reducers/usersApi";
import Reshare from "./Reshare/index";

import {
  font,
  generateRandomColor,
  getHeightPixel,
  getWidthPixel,
  showInitials,
} from "../../helper";
import LikeIcon from "react-native-vector-icons/AntDesign";
import CommentIcon from "react-native-vector-icons/EvilIcons";
import EditIcon from "react-native-vector-icons/MaterialIcons";
import SharedPeoples from "../SharedPeoples";
import { TouchableOpacity } from "react-native-gesture-handler";
import PostAttachmentList from "./../PostAttachmentList";

import Comments from "./Comments";
import FullPost from "./FullPost";
import { styles } from "./styles";
import likePosts from "../../../pages/Landing/Api/likePosts";
import { useGetCommentsQuery } from "../../../Reducers/postsApi";
import AddComment from "./AddComment";
import PostLikeAndShareList from "./PostLikesList";
import PostHeader from "./../PostHeader/index";

// COMPONENT BODY
const Post = memo(
  ({
    post,
    sharedProfiles,
    user_id,
    id,
    userDetails,
    postListRef,
    postIndex,
    navigation,
    showAttachmentPicker,
    attachmentShown,
    pickerData,
    clearPickerData,
    setLoading,
    isMediaLoading
  }) => {
    const commentInputRef = useRef();
    const [textShown, setTextShown] = useState(false); //To show ur remaining Text
    const [showCom, setCom] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [shareModal, setShareModal] = useState(false);
    const [imageIndex, setImageIndex] = useState(null);
    const [mylike, setMylike] = useState(post.liked_by_me);
    const [sentStatus, setStatus] = useState(false);
    const [likeCounter, setLikeCounter] = useState(post.liked_count);
    const [likesListModal, setLikesListModal] = useState(false);
    const [modalType, setModalType] = useState(false);
    const [commentAdded, setCommentAdded] = useState(false);
    const { data: adminData, isFetching } = useGetUserQuery();

    const [commentType, setCommentType] = useState({ type: "", id: "" });

    const date = post?.created_at;

    const commentsData = useGetCommentsQuery(post.id);
    const [postComments, setPostComments] = useState(commentsData?.data);

    const resharedDate = post.payload?.repostInfo?.created_at;
    useEffect(() => {
      if (showCom) {
        commentInputRef.current.focus();
      }
    }, [showCom, commentAdded]);

    const refreshComment = () => {
      commentsData.refetch();
    };

    useEffect(() => {
      if (commentsData?.data) {
        setPostComments(commentsData?.data);
      }
    }, [commentsData.data]);

    //console.log("sent status", sentStatus);

    const repostCheck = post.payload.hasOwnProperty("repostInfo");
    // console.log("post.payload.repostInfo: ", post.payload?.repostInfo);
    const repostComment = post.payload.comment;

    //  console.log("repostImage: ", repostImage);

    const colorScheme = Appearance.getColorScheme();
    const toggleNumberOfLines = () => {
      //To toggle the show text or hide it
      setTextShown(!textShown);
    };

    //like post function
    const likeHandler = async (id) => {
      console.log("userId====>", id);
      const res = await likePosts(id);
      const like = res.liked_by_me;
      const count = res.counter;
      console.log("response AT like====>", JSON.stringify(res));
      setMylike(like);
      setLikeCounter(count);
    };

    const setText = () => {
      let text = "";
      if (post?.payload?.text.length > 80 && !textShown) {
        for (let i = 0; i < 80; i++) {
          text += post?.payload?.text[i];
        }
      } else {
        text = post?.payload?.text;
      }
      return text;
    };
    return (
      // SINGLE POST COMPONENTmoda
      <View style={styles.container}>
        {/* POST HEADER */}
        <View style={styles.headerWrapper}>
          <PostHeader
            name={post?.user_info.display_name}
            img={post?.user_info?.avatar.url}
            date={date}
            type={"postheader"}
            userId={post.user}
            navigation={navigation}
          />
          {post?.created_by === user_id ? (
            <TouchableOpacity
              style={styles.editIconWrapper}
              onPress={() => {
                navigation.navigate({
                  name: "CreatePost",
                  params: {
                    post: post,
                    user_id: user_id,
                    id: post?.id,
                    userDetails: userDetails,
                    postIndex: postIndex,
                    nameList: post?.payload?.feeds,
                    postType: "editPost",
                    setLoader: true,
                  },
                  merge: true,
                });
              }}
            >
              <EditIcon
                name="edit"
                size={12}
                color={colorScheme == "dark" ? colors.black : colors.accentGray}
              />
            </TouchableOpacity>
          ) : null}
        </View>
        {post?.payload?.feeds?.length != 0 ? (
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              paddingTop: getHeightPixel(10),
            }}
          >
            {post?.payload?.feeds?.map((item, index) => (
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate("GetPostList", {
                    id: item.id,
                    type: "Member",
                  });
                  console.log("clicked on feeds ");
                }}
                key={index.toString()}
              >
                <View
                  style={{
                    backgroundColor: colors.accentGray,
                    flexDirection: "row",
                    paddingHorizontal: 4,
                    borderRadius: 20,
                    alignItems: "center",
                    marginLeft: getWidthPixel(4),
                    marginVertical: getHeightPixel(4),
                  }}
                //  key={index}
                >
                  <View
                    style={{
                      height: getHeightPixel(20),
                      width: getWidthPixel(20),
                      borderRadius: 10,
                      marginVertical: 2,
                      backgroundColor: generateRandomColor(index),

                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        textAlign: "center",
                        //   color: item.color,
                        ...font(11, "bold"),
                        color: colors.white,
                        alignSelf: "center",
                      }}
                    >
                      {showInitials(item.display_name)}
                    </Text>
                  </View>
                  <Text
                    style={{
                      ...font(14, "bold"),
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      color: "#fff",
                    }}
                  >
                    {item.display_name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <></>
        )}
        <>
          {repostCheck ? (
            <View style={styles.repostInfo}>
              <Text style={styles.repostComment}>{repostComment}</Text>
              <Text style={styles.repostof}>Repost of</Text>

              <PostHeader
                name={post.payload?.repostInfo?.display_name}
                img={adminData?.avatar?.url}
                date={resharedDate}
                type={"repostheader"}
                userId={post?.payload?.repostInfo?.id}
                navigation={navigation}
              />
            </View>
          ) : null}
        </>
        {/* POST DESCRIPTION */}
        <View style={styles.descriptionWrapper}>
          <Text
            // onTextLayout={onTextLayout}
            style={styles.description}
          >
            {setText()}
          </Text>
          {post?.payload?.text?.length > 80 ? (
            <Text
              onPress={toggleNumberOfLines}
              style={{
                lineHeight: 21,
                marginTop: 5,
                color: colors.inputBlue,
              }}
            >
              {textShown ? " Read less..." : " Read more..."}
            </Text>
          ) : null}
        </View>
        {/* SHARED PEOPLE'S PROFILE ICONS */}
        <View>
          {sharedProfiles?.length != 0 ? (
            <SharedPeoples profiles={sharedProfiles} />
          ) : null}
        </View>

        <PostAttachmentList
          attachmentWidth={post?.attachments?.length > 1 ? 75 : 100}
          data={post?.attachments}
          openingFrom={"mainLanding"}
          onAttachmentPressed={(index) => {
            setImageIndex(index);
            setModalVisible(true);
          }}
        />

        {/* POST LIKES & COMMENTS */}
        <View style={styles.postAnalyticWrapper}>
          <TouchableOpacity
            onPress={() => {
              // openPostLikesModal(post.id);
            }}
          >
            <Text style={styles.likeText}>Like {likeCounter}</Text>
          </TouchableOpacity>
          <View style={styles.commentShareWrapper}>
            <TouchableOpacity
              onPress={() => {
                console.log("comments preseed");
              }}
            >
              <Text style={styles.likeText}>
                {post?.comment_count} Comments
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                //  openPostSharesListModal(post.id)
              }}
            >
              <Text
                style={{ ...styles.likeText, marginLeft: getWidthPixel(10) }}
              >
                {post.repost_count} Shares{" "}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* POST ACTIONS i.e LIKE, COMMENT & SHARE */}
        <View style={styles.postActionsWrapper}>
          <View style={styles.likeShareContainer}>
            {post?.user_info?.id === user_id ? null : (
              <TouchableOpacity
                onPress={async () => {
                  await likeHandler(post?.id);
                  return;
                }}
                style={styles.likeIcon}
              >
                <LikeIcon
                  name={"like2"}
                  size={19}
                  color={mylike ? colors.inputBlue : colors.accentGray}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.commentIcon}
              onPress={() => {
                // console.log("comment count", post.comment_count);
                setCom(!showCom);
                clearPickerData([]);
                if (postListRef) {
                  postListRef.scrollToIndex({
                    animated: true,
                    index: postIndex,
                    viewOffset: post?.attachments?.length ? -150 : 10,
                  });
                }
              }}
            >
              <CommentIcon name="comment" size={25} color={colors.accentGray} />
            </TouchableOpacity>
          </View>

          {post?.user_info?.id === user_id ||
            post?.payload?.repostInfo ? null : (
            <TouchableOpacity onPress={() => setShareModal(!shareModal)}>
              <View style={styles.shareIcon}>
                <CommentIcon
                  name="retweet"
                  size={26}
                  color={colors.accentGray}
                />
              </View>
            </TouchableOpacity>
          )}
        </View>
        {/* COMMENTS COMPONENT FOR EACH POST  */}
        <View>
          {post?.comment_count != 0 ? (
            <Comments
              data={postComments}
              show={sentStatus}
              post={post}
              sharedProfiles={sharedProfiles}
              user_id={user_id}
              id={id}
              userDetails={userDetails}
              postListRef={postListRef}
              postIndex={postIndex}
              showCommentInput={setCom}
              showCom={showCom}
              myId={user_id}
              navigation={navigation}
              setCommentType={setCommentType}
              type={"comments"}
              nestingLevel={"1"}
            />
          ) : null}
        </View>
        {/* Add comment component */}
        {showCom && (
          <AddComment
            inputRef={commentInputRef}
            post={post}
            method={setCommentAdded}
            onAddComment={refreshComment}
            userId={user_id}
            showAttachmentPicker={showAttachmentPicker}
            attachmentShown={attachmentShown}
            pickerData={pickerData}
            clearPickerData={clearPickerData}
            setLoading={setLoading}
            commentType={commentType}
            isMediaLoading={isMediaLoading}
          />
        )}
        {/* Modal for Repost/reshare */}
        <Modal
          animationType="slide"
          visible={shareModal}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setShareModal(false);
          }}
        >
          <Reshare
            closeModal={() => setShareModal(!shareModal)}
            postText={post.payload.text}
            postdata={post}
            userdata={userDetails}
          />
        </Modal>
        {/*likes list modal*/}
        <Modal
          animationType="slide"
          transparent={true}
          visible={likesListModal}
          onRequestClose={() => {
            Alert.alert("Modal has been closed.");
            setLikesListModal(false);
          }}
        >
          <PostLikeAndShareList
            postId={post.id}
            navigation={navigation}
            closeModal={setLikesListModal}
            likeCount={likeCounter}
            modalType={modalType}
          />
        </Modal>

        {/* SHOW MODAL */}
        <GestureRecognizer
          style={{ flex: 1 }}
          onSwipeDown={() => console.log("modal is close")}
        >
          <View style={styles.centeredView}>
            <Modal
              statusBarTranslucent={false}
              presentationStyle="pageSheet"
              animationType="fade"
              presentationStyle="overFullScreen"
              visible={modalVisible}
              onRequestClose={() => {
                //  Alert.alert("Modal has been closed.");
                setModalVisible(!modalVisible);
              }}
            >
              {/* SHOW MODAL VISIBILY AND SEND post PROP */}
              <FullPost
                avatar={post?.user_info?.avatar?.url}
                name={post?.user_info?.display_name}
                createdAt={post?.attachments[0]?.created_at ?? post?.created_at}
                text={post?.payload?.text}
                attachments={post?.attachments}
                image={post?.attachments[imageIndex]?.url}
                closeModal={setModalVisible}
                type={post?.attachments[imageIndex]?.payload?.fileType}
                id={post?.user_info?.id}
                currentTabIndex={imageIndex}
              />
            </Modal>
          </View>
        </GestureRecognizer>
      </View>
    );
  }
);

export default Post;
