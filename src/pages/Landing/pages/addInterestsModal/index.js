import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Modal,
  Text,
  Pressable,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  Platform,
  SectionList,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { AddInterestModalStyles } from "./styles";
import Icon from "react-native-vector-icons/AntDesign";

import colors from "../../../../common/colors";
import ButtonCommon from "../../../../common/Components/Buttons";
import SearchableDropdown from "react-native-searchable-dropdown";
import { updateUserInfo } from "../../../../Reducers/userReducer";
import Icon2 from "react-native-vector-icons/AntDesign";
import {
  getHeightPixel,
  getWidthPixel,
  font,
  showInitials,
  getWidthPercentage,
  getHeightPercentage,
} from "../../../../common/helper";
import { InterestsAPI } from "../../../Authenticate/API/interestsAPI";
import MaterialIcon from "react-native-vector-icons/MaterialIcons";
import updateProfileIntresetsAPI from "../../Api/updateProfileIntresetsAPI";
import { Appearance } from "react-native";
import { useDispatch } from "react-redux";
import { useGetUserQuery } from "../../../../Reducers/usersApi";
import EmptyProfileComp from '../../../../common/Components/Profile/EmptyProfileComp'

const AddInterestsModal = (props) => {
  const dropdownRef = useRef();
  const [tags, setTags] = useState([]);
  const [selectedTags, selectTags] = useState([]);
  const [InterestsList, setInterestsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const newSectionList = useRef([]);
  const [selectedSectionList, setSelctedSectionList] = useState([]);
  const [showList, setShowList] = useState(false);
  const [tempHeight, setTempHeight] = useState(0);
  const dispatch = useDispatch();

  const { data: userInfo, isFetching: fetch } = useGetUserQuery();

  const [selectedItems, selectItems] = useState([]);
  console.log("users already interests", userInfo);

  const colorScheme = Appearance.getColorScheme();

  const putRequest = async () => {
    setLoading(true);
    const body = {
      interests: selectedItems,
    };

    console.log("Hello i am logged in");
    const received = await updateProfileIntresetsAPI(body, (id = userInfo.id));
    console.log(
      "updateProfileIntresetsAPI response => ",
      JSON.stringify(received)
    );
    console.log("i am lenth", received.data, "i am sent");
    if (received) {
      dispatch(updateUserInfo(received));
      showToast();
      setLoading(false);

      // return false;
    } else {
      setLoading(false);
      Alert.alert("Failed to update intresets, check your internet connection");
    }
    setLoading(false);

    // console.log("Intreset Data", InterestsList);
  };

  const checkList = (item) => {
    // console.log("i am item", item.id);

    const newTags = selectedItems.filter((temp) => temp.id !== item.id);
    console.log("selecred tags", newTags.length);
    selectItems(newTags);
    // console.log(selectedTags.length);
  };

  const showToast = () => {
    Toast.show({
      type: "success",
      text1: `Success`,
      text2: `Interests are updated Sucessfully`,
      visibilityTime: 1500,
    });
  };

  const getAPIdata = async () => {
    const data = await InterestsAPI();

    //console.log("here data user", userInfo.interests);

    selectItems(
      userInfo?.interests?.map((item) => {
        return {
          ...item,
          imgUrl: item.avatar.upload,
          color: "#" + Math.floor(Math.random() * 16777215).toString(16),
        };
      })
    );

    console.log("API", data);
    const newdata = data.map((item) => {
      return {
        ...item,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      };
    });
    console.log("this is data ", newdata.length);
    createSectionList(newdata);
    setInterestsList(newdata);
    _getButtonItems(newdata);
  };

  const createSectionList = (data, flag = false, searchText) => {
    if (flag) {
      let arr = data.filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );
      data = arr;
    }
    let categories = [];
    data.map((item) => {
      if (!categories.includes(item.interest_map_groups[0])) {
        categories.push(item.interest_map_groups[0]);
      }
    });
    let tempSection = [];
    categories.map((item) => {
      tempSection.push({
        title: item.substring(2, item.length),
        data: data.filter((val) => val.interest_map_groups[0] == item),
      });
    });
    newSectionList.current = tempSection;
  };

  const _getButtonItems = (newdata) => {
    const items = [];

    function compare(a, b) {
      if (a.interest_map_groups[0] < b.interest_map_groups[0]) {
        return -1;
      }
      if (a.interest_map_groups[0] > b.interest_map_groups[0]) {
        return 1;
      }
      return 0;
    }

    const sorted = newdata.sort(compare);

    sorted.forEach((i) => {
      //   console.log("interest item: ", i);
      const g = i.interest_map_groups ? i.interest_map_groups[0] : "";
      const name = g?.substring(g.indexOf("-") + 1).replaceAll("-", " ");
      if (name && !items.some((j) => j === g)) {
        items.push(g);
      }
    });
    console.log(InterestsList.length);
    // console.log("tags", items);
    setTags(items);
    console.log("catagories are ", items);
    // console.log("new tags", tags);

    return items;
  };

  const createSelectedSectionList = () => {
    if (selectedItems?.length == 0) {
      return;
    }
    let categories = [];
    selectedItems?.map((item) => {
      if (!categories.includes(item.interest_map_groups[0])) {
        categories.push(item.interest_map_groups[0]);
      }
    });
    let tempSection = [];
    categories.map((item) => {
      tempSection.push({
        title: item.substring(2, item.length),
        data: selectedItems.filter((val) => val.interest_map_groups[0] == item),
      });
    });
    setSelctedSectionList(tempSection);
  };

  useEffect(() => {
    getAPIdata();
  }, [userInfo?.interests]);
  useEffect(() => {
    createSelectedSectionList();
  }, [selectedItems]);
  const Container = Platform.OS == "ios" ? View : ScrollView;
  const iosSectionStyle =
    Platform.OS == "ios"
      ? {
          // position: "absolute",
          // // top: tempHeight,
          // left: getWidthPixel(15),
          // right: getWidthPixel(15),
        }
      : {};
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={props.visibility}
      onRequestClose={() => {
        // Alert.alert("Modal has been closed.");
        console.log("alrt is closed");
      }}
    >
      <ScrollView style={AddInterestModalStyles.ModalContainer}>
        <View>
          <SafeAreaView>
            <View style={AddInterestModalStyles.header}>
              <View style={AddInterestModalStyles.closeButton}>
                <TouchableOpacity
                  onPress={() => {
                    // addTags((prevtags) => [...prevtags, "new tags"]);
                    // selectItems(props?.list);
                    props.modal(false);
                  }}
                >
                  <Icon name="close" size={21} color={colors.accentGray} />
                </TouchableOpacity>
              </View>

              <View style={AddInterestModalStyles.title}>
                <Text style={AddInterestModalStyles.titleText}>Add Sports</Text>
              </View>
            </View>
          </SafeAreaView>
        </View>

        {/* <View style={{ flexDirection: "row" }}>
          <SearchableDropdown
            onTextChange={(text) => console.log(text)}
            //On text change listner on the searchable input
            onItemSelect={(item) => {
              selectItems((prev) => [...prev, item]);
              console.log(selectedItems);
            }}
            //onItemSelect called after the selection from the dropdown
            containerStyle={{
              width: getWidthPercentage(86),
              // height:getHeightPixel(43),
              paddingLeft: getWidthPixel(16),
            }}
            //suggestion container style
            textInputStyle={{
              //inserted text style
              padding: getHeightPixel(10),
              height: getHeightPixel(36),
              borderWidth: 1,
              borderBottomWidth: 2,
              borderTopLeftRadius: getWidthPixel(5),
              borderBottomLeftRadius: getWidthPixel(5),
              borderColor: colors.accentGray,

              // height: getHeightPixel(90),
              color: colors.mineShaft,
            }}
            focus={true}
            itemStyle={{
              //single dropdown item style
              //padding: 10,
              //marginTop: 2,
              backgroundColor: colors.white,
              borderColor: colors.accentGray,
              padding: 10,
              //borderWidth: 1,
            }}
            itemTextStyle={{
              //text style of a sing  A23S473  le dropdown item
              color: "#222",
            }}
            itemsContainerStyle={{
              //items container style you can pass maxHeight
              //to restrict the items dropdown hieght
              height: getHeightPercentage(80),
            }}
            items={InterestsList.filter(
              (c) =>
                (c.interest_map_groups &&
                  selectedTags.includes(c.interest_map_groups[0])) ||
                selectedTags.length === 0
            )}
            listProps={{ showsVerticalScrollIndicator: false }}
            //mapping of item array
            //defaultIndex={2}
            //default selected item index
            placeholder="Search"
            //place holder for the search input
            resetValue={false}
            //reset textInput Value with true and false state
            underlineColorAndroid="transparent"
            //To remove the underline from the android input
            ref={dropdownRef}
          />
          <TouchableOpacity
            onPress={() => dropdownRef.current.makeFocussed()}
            style={{
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: colors.iconsBackground,
              width: getWidthPixel(36),
              height: getHeightPixel(36),
              borderWidth: 1,
              borderTopRightRadius: getWidthPixel(3),
              borderBottomRightRadius: getWidthPixel(3),
              borderColor: colors.accentGray,
            }}
          >
            <MaterialIcon
              name={"arrow-drop-down"}
              size={24}
              color={colors.black}
            />
          </TouchableOpacity>
        </View> */}
        {/* Sports section stars here */}
        <View
          onLayout={(e) => setTempHeight(e.nativeEvent.layout.height)}
          style={{
            zIndex: 1,
          }}
        >
          <Text style={AddInterestModalStyles.sports}>Sports</Text>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              height: getHeightPixel(36),
              marginHorizontal: getWidthPixel(15),
              borderRadius: 10,
            }}
          >
            <TextInput
              placeholder="Search.."
              placeholderTextColor={colors.accentGray}
              onChangeText={(val) =>
                createSectionList(InterestsList, true, val)
              }
              style={{
                flex: 1,
                padding: getHeightPixel(10),
                borderWidth: 1,
                borderBottomWidth: 2,
                borderTopLeftRadius: getWidthPixel(5),
                borderBottomLeftRadius: getWidthPixel(5),
                borderColor: colors.accentGray,
                color: colors.mineShaft,
              }}
            />
            <TouchableOpacity
              onPress={() => setShowList(!showList)}
              style={{
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "center",
                backgroundColor: colors.iconsBackground,
                width: getWidthPixel(36),
                height: getHeightPixel(36),
                borderWidth: 1,
                borderTopRightRadius: getWidthPixel(3),
                borderBottomRightRadius: getWidthPixel(3),
                borderColor: colors.accentGray,
              }}
            >
              <MaterialIcon
                name={"arrow-drop-down"}
                size={24}
                color={colors.black}
              />
            </TouchableOpacity>
          </View>
          {/* Section List here */}
          {showList && (
            <View
              style={{
                maxHeight: getHeightPixel(300),
                marginHorizontal:
                  // Platform.OS == "android" ? getWidthPixel(15) : 0,
                  getWidthPixel(15),
                backgroundColor: colors.white,
                borderColor: colors.accentGray,
                borderWidth: 0.6,
                borderBottomLeftRadius: 5,
                borderBottomRightRadius: 5,
                borderTopWidth: 0,
                // ...iosSectionStyle,
              }}
            >
              <SectionList
                sections={newSectionList.current}
                nestedScrollEnabled
                stickySectionHeadersEnabled={true}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => item + index}
                renderItem={({ item }) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        selectItems((prev) => [...prev, item]);
                        console.log(selectedItems);
                      }}
                    >
                      <View
                        style={{
                          marginLeft: getWidthPixel(16),
                          flexDirection: "row",
                          alignItems: "center",
                          marginVertical: getHeightPixel(5),
                        }}
                      >
                        <EmptyProfileComp
                          name={item.name}
                          userId={item.id}
                          containerStyle={{
                            width: getWidthPixel(26),
                            height: getWidthPixel(26),
                          }}
                        />
                        <Text style={{}}>{item.name}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                }}
                renderSectionHeader={({ section: { title } }) => (
                  <View
                    style={{
                      paddingLeft: getWidthPixel(16),
                      backgroundColor: "white",
                      paddingVertical: getHeightPixel(5),
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Segoe UI",
                        fontSize: 14,
                        color: colors.black,
                        fontWeight: "800",
                      }}
                    >
                      {title}
                    </Text>
                  </View>
                )}
              />
            </View>
          )}
        </View>

        {/* <DropDownPicker
          open={open}
          value={value}
          items={groupItems}
          setOpen={setOpen}
          setValue={setValue}
          setItems={setGroupItems}
          dropDownDirection="BOTTOM"
          // placeholder="Social Group"
          style={{
            backgroundColor: colors.searchBlue,
            height: getHeightPixel(35),
            paddingVertical: 0,
            width: getWidthPixel(55),
          }}
          listMode="SCROLLVIEW"
        /> */}

        <View
          style={{
            backgroundColor: colors.silverWhite,
            paddingTop: getHeightPixel(21),
            paddingLeft: getWidthPixel(15),
          }}
        >
          {selectedSectionList?.length != 0
            ? selectedSectionList.map((section, index) => (
                <View key={index}>
                  <Text
                    style={{
                      fontFamily: "Segoe UI",
                      fontSize: 14,
                      color: colors.black,
                      fontWeight: "800",
                    }}
                  >
                    {section.title}
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                    {section.data?.map((item, i) => (
                      <View key={i.toString()}>
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
                        >
                          <View
                            style={{
                              height: getHeightPixel(20),
                              width: getWidthPixel(20),
                              borderRadius: 40,
                              marginVertical: 2,
                              backgroundColor: item.color,
                            }}
                          >
                            <Text
                              style={{
                                textAlign: "center",
                                ...font(13, "bold"),
                                // color: item.color,
                                color: "white",
                              }}
                            >
                              {showInitials(item.name)}
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
                            {item.name}
                          </Text>
                          <TouchableWithoutFeedback
                            onPress={
                              () => checkList(item) //REMOVE ITEM FROM NAMELIST....
                            }
                          >
                            <Icon name="close" size={12} color="#fff" />
                          </TouchableWithoutFeedback>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ))
            : null}
        </View>

        <View style={AddInterestModalStyles.tagsContainer}>
          {tags.map((tag, key) => (
            <TouchableOpacity
              key={key.toString()}
              onPress={() => {
                //_filterGroup(tag);
                console.log("Tagger", selectedTags);
                if (selectedTags.find((item) => item === tag)) {
                  selectTags(selectedTags.filter((item) => item !== tag));
                  console.log("Tagger1", selectedTags);
                } else {
                  selectTags((prevTags) => [...prevTags, tag]);
                }

                // selectTags(
                //   selectedTags.filter((item) => item !== tag)
                // );
                console.log(tag, "pressed");
                //selectTags(tag);
              }}
            >
              <View
                style={{
                  ...AddInterestModalStyles.tag,
                  backgroundColor: selectedTags.find((item) => item === tag)
                    ? colors.accentGray
                    : "white",
                }}
              >
                <Text
                  key={key}
                  style={[
                    AddInterestModalStyles.TagsText,
                    {
                      color: selectedTags.find((item) => item === tag)
                        ? "white"
                        : "black",
                    },
                  ]}
                >
                  {tag.substring(tag.indexOf("-") + 1).replaceAll("-", " ")}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    // selectTags(
                    // selectedTags.filter((item) => item !== tag)
                    // );
                    console.log("remove tag pressed");
                    //addTags(tags.filter((item) => item !== tag));
                  }}
                >
                  <Icon2
                    name={
                      selectedTags.find((item) => item === tag)
                        ? "minus"
                        : "plus"
                    }
                    size={18}
                    color={colors.black}
                    style={
                      selectedTags.find((item) => item === tag)
                        ? { color: colors.white }
                        : { color: colors.black }
                    }
                  />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View
          style={{
            ...AddInterestModalStyles.saveButton,
            paddingTop: getHeightPixel(10),
          }}
        >
          <ButtonCommon
            title={"CONTINUE"}
            method={async () => {
              const close = await putRequest();
              props.modal(false);
            }}
            color={colors.primary}
            loading={loading}
          />
        </View>
      </ScrollView>
    </Modal>
  );
};

export default AddInterestsModal;
