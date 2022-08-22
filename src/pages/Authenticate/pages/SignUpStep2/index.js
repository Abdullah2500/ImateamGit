import React, { useEffect, useState, useRef } from "react";

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  BackHandler,
  unstable_batchedUpdates,
  ScrollView,
  TextInput
} from "react-native";
import { FlatList } from "react-native-gesture-handler";
import images from "../../../../common/images";

import { SignUpStep2Styles } from "./styles";
import ButtonCommon from "../../../../common/Components/Buttons";
import colors from "../../../../common/colors";
import Icon from "react-native-vector-icons/MaterialIcons";
import Icon3 from "react-native-vector-icons/MaterialCommunityIcons";
import { Appearance } from "react-native";

import {
  getHeightPixel,
  getWidthPixel,
  moveToNextScreen,
  font,
} from "../../../../common/helper";
import Icon2 from "react-native-vector-icons/AntDesign";
import DatePicker from "react-native-date-picker";

import { useSelector, useDispatch } from "react-redux";
import { userSignupStep2 } from "../../../../Reducers/userReducer";
import SearchableDropdown from "react-native-searchable-dropdown";
import { InterestsAPI } from "../../API/interestsAPI";
import { SignUpStep2API } from "../../API/SignUpStep2";
import { ShowInitialsOfName } from "../../../../common/Components/ShowInitialsOfName";
import EmptyProfileComp from "../../../../common/Components/Profile/EmptyProfileComp";

const SignUpStep2 = ({ navigation }) => {
  const dropdownRef = useRef();
  //const keyboardVerticalOffset = Platform.OS === "ios" ? 0 : 0;
  const colorScheme = Appearance.getColorScheme();
  const [isLoading, setLoading] = useState(false);
  const [isDateDefault, changeDateDefault] = useState(true);

  //retreve previous form data from redux
  const userRedux = useSelector((state) => state.user);
  console.log(" step 2", userRedux.userInfo);

  //console.log(" step 2 from redux", userRedux);

  const dispatch = useDispatch();
  const [date, setDate] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [showList, setShowList] = useState(false)

  console.log(date);

  const [tags, setTags] = useState([]);

  const InterestsList = useRef([]);

  const [selectedItems, selectItems] = useState([]);

  const [selectedTags, selectTags] = useState([]);

  const getAPIdata = async () => {
    const data = await InterestsAPI();
    console.log("newData====>", data);

    //console.log("API", data);
    const newdata = data.map((item) => {
      return {
        ...item,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
      };
    });
    InterestsList.current = newdata;
    _getButtonItems(newdata);
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
      console.log("interest item: ", i);
      const g = i.interest_map_groups ? i.interest_map_groups[0] : "";
      const name = g?.substring(g.indexOf("-") + 1).replaceAll("-", " ");
      if (name && !items.some((j) => j === g)) {
        items.push(g);
      }
    });
    console.log("tags", items);
    setTags(items);

    console.log("new tags", tags);

    return items;
  };
  //and here is the code to filter the list in the multi-select.
  // const _filterGroup = (group) => {
  //   setInterestsList(
  //     InterestsList.filter(
  //       (c) => c.interest_map_groups && c.interest_map_groups[0] !== group
  //     )
  //   );
  //   //setIsOpen(true);
  //   //console.log(InterestsList.length, InterestsList);
  // };
  // console.log(InterestsList.length);

  function handleBackButtonClick() {
    navigation.goBack();

    return true;
  }

  const checkDate = async () => {
    setLoading(true);
    const dob =
      date.getMonth() + 1 + "-" + date.getDate() + "-" + date.getFullYear();

    const currentYear = new Date().getFullYear();

    if (date.getFullYear() < currentYear) {
      console.log("i am current year ", currentYear);
      dispatch(userSignupStep2({ dob: dob, selectedItems }));
      console.log(
        "data  ready for  api call",
        userRedux.userInfo.email,
        userRedux.userInfo.first_name,
        userRedux.userInfo.last_name,
        dob,
        selectedItems
      );
      const res = await SignUpStep2API(
        userRedux.userInfo.email,
        userRedux.userInfo.first_name,
        userRedux.userInfo.last_name,
        dob,
        selectedItems
      );

      if (res) {
        moveToNextScreen(navigation, "SignUpStep3");
        setLoading(false);
      }
      console.log(res);
      setLoading(false);
    } else {
      setLoading(false);
      alert(JSON.stringify("Date of Birth is invalid"));
    }
    //setModalVisible(true);
  };
  const updated = () => {
    const userReduxafter = useSelector((state) => state.user);
    console.log(userReduxafter);
  };

  const day = () => {
    let temp = date ? true : false;
    console.log(temp);
    return temp;
  };
  const month = () => {
    let temp = new Date();
    temp = temp.getMonth();
    console.log(temp);
    return temp;
  };
  const year = () => {
    let temp = new Date();
    temp = temp.getFullYear();
    console.log(temp);
    return temp;
  };
  useEffect(() => {
    getAPIdata();
    BackHandler.addEventListener("hardwareBackPress", handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        "hardwareBackPress",
        handleBackButtonClick
      );
    };
  }, []);

  const mainList = InterestsList.current.filter(
    (c) =>
      (c.interest_map_groups &&
        selectedTags.includes(c.interest_map_groups[0])) ||
      selectedTags.length === 0
  )
  const [filteredArr, setFilteredArr] = useState([])
  const [searchTxt, setSearchTxt] = useState('')
  return (
    <View style={SignUpStep2Styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={"position"}
      // keyboardVerticalOffset={keyboardVerticalOffset}
      >
        <SafeAreaView />
        <Pressable
          onPress={() => moveToNextScreen(navigation, "SignUpStep1")}
        >
          <View
            style={{
              ...SignUpStep2Styles.backButtonWrapper,
              marginLeft: getWidthPixel(-5)
            }}
          >
            <Icon
              name="keyboard-arrow-left"
              size={21}
              color={colors.black}
            />
            <Text style={SignUpStep2Styles.backButtonText}>Back</Text>
          </View>
        </Pressable>
        <FlatList
          data={[1]}
          showsVerticalScrollIndicator={false}
          // nestedScrollEnabled
          ListHeaderComponent={() => <View>
            <View style={SignUpStep2Styles.imgWrapper}>
              <Image
                source={images.SignUpStep2Image}
                style={SignUpStep2Styles.img}
              />
            </View>

            <View>
              <Text style={SignUpStep2Styles.Heading}>
                A little more info to {"\n"} get started.
              </Text>
            </View>

            <View>
              <Text style={SignUpStep2Styles.dob}>Date of Birth</Text>
            </View>
            <View style={SignUpStep2Styles.picker}>
              <TouchableOpacity onPress={() => setOpen(!open)}>
                <View style={SignUpStep2Styles.day}>
                  <Text style={{ color: colors.black }}>
                    {isDateDefault ? "Day" : date.getDate()}
                  </Text>

                  <Icon name="arrow-drop-down" size={21} color={colors.black} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOpen(!open)}>
                <View style={SignUpStep2Styles.month}>
                  <Text style={{ color: colors.black }}>
                    {isDateDefault ? "Month" : date.getMonth() + 1}
                  </Text>
                  <Icon name="arrow-drop-down" size={21} color={colors.black} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setOpen(!open)}>
                <View style={SignUpStep2Styles.year}>
                  <Text style={{ color: colors.black }}>
                    {isDateDefault ? "Year" : date.getFullYear()}
                  </Text>
                  <Icon name="arrow-drop-down" size={21} color={colors.black} />
                </View>
              </TouchableOpacity>
            </View>

            {/* <Pressable
          onPress={() => setModalVisible(true)}
          style={{ zIndex: 1 }}
        >
          <View style={SignUpStep2Styles.interests}>
          <DataPicker data={Interests} label={"Interests"} />
        </View> 
        </Pressable> */}
            <View>
              <Text style={SignUpStep2Styles.sports}>Sports</Text>
            </View>
          </View>}
          renderItem={() =>
            <>
              <View
                style={{
                  flexDirection: "row",
                  borderWidth: 1,
                  borderColor: colors.accentGray,
                  backgroundColor: colors.white,
                  borderRadius: 6,
                }}
              >
                {/* <SearchableDropdown
                    ref={dropdownRef}
                    onTextChange={(text) => console.log(text)}
                    onItemSelect={(item) => {
                      let newArr = InterestsList.current.filter((i, index) => {
                        return i.id !== item.id;
                      });
                      InterestsList.current = newArr;
                      dropdownRef.current.makeFocussed();
                      selectItems((prevTags) => [...prevTags, item]);
                    }}
                    containerStyle={{
                      padding: 0,
                    }}
                    textInputStyle={{
                      //inserted text style
                      padding: 12,
                      height: getHeightPixel(46),
                      color: colors.mineShaft,
                    }}
                    focus={true}
                    itemStyle={{
                      backgroundColor: colors.white,
                      borderColor: colors.accentGray,
                      padding: 10,
                    }}
                    itemTextStyle={{
                      color: "#222",
                    }}
                    itemsContainerStyle={{
                      //items container style you can pass maxHeight
                      //to restrict the items dropdown hieght
                      maxHeight: getHeightPixel(200),
                      // marginBottom: getHeightPixel(10),
                    }}
                    items={InterestsList.current.filter(
                      (c) =>
                        (c.interest_map_groups &&
                          selectedTags.includes(c.interest_map_groups[0])) ||
                        selectedTags.length === 0
                    )}
                    listProps={{
                      showsVerticalScrollIndicator: false,
                    }}
                    placeholder="Search"
                    placeholderTextColor={colors.accentGray}
                    resetValue={false}
                    underlineColorAndroid="transparent"
                  /> */}
                <TextInput
                  placeholder="Search.."
                  placeholderTextColor={colors.accentGray}
                  onFocus={() => setShowList(true)}
                  onBlur={() => setShowList(false)}
                  onChangeText={(val) => {
                    setSearchTxt(val)
                    let arr = mainList.filter(el => el.name.toLowerCase().includes(val.toLowerCase()))
                    setFilteredArr(arr)
                  }}
                  style={{
                    flex: 1,
                    padding: getHeightPixel(10),
                    borderTopLeftRadius: getWidthPixel(5),
                    borderBottomLeftRadius: getWidthPixel(5),
                    color: colors.mineShaft,
                  }}
                />
                <TouchableOpacity
                  // onPress={() => dropdownRef.current.makeFocussed()}
                  onPress={() => setShowList(!showList)}
                >
                  <Icon
                    name="arrow-drop-down"
                    size={21}
                    color={colors.black}
                    style={{
                      alignSelf: "center",
                      backgroundColor: colors.searchBlue,
                      paddingHorizontal: getWidthPixel(14),
                      paddingVertical: getHeightPixel(14),
                      borderLeftWidth: 1,
                      borderRightWidth: 0,
                    }}
                  />
                </TouchableOpacity>
              </View>

              {/* List here */}
              {showList && (
                <View
                  style={{
                    maxHeight: getHeightPixel(300),
                    backgroundColor: colors.white,
                    borderColor: colors.accentGray,
                    borderWidth: 0.6,
                    borderBottomLeftRadius: 5,
                    borderBottomRightRadius: 5,
                    borderTopWidth: 0,
                  }}
                >
                  <FlatList
                    data={searchTxt !== '' ? filteredArr : mainList}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => item + index}
                    renderItem={({ item }) => {
                      return (
                        <TouchableOpacity
                          onPress={() => {
                            // selectItems((prev) => [...prev, item]);
                            let newArr = InterestsList.current.filter((i, index) => {
                              return i.id !== item.id;
                            });
                            InterestsList.current = newArr;
                            selectItems((prevTags) => [...prevTags, item]);
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
                    ListEmptyComponent={() => <View style={{
                      backgroundColor: 'white',
                      height: 80,
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <Text style={{
                        fontFamily: 'Segoe UI',
                        color: 'black',
                        fontSize: 14
                      }}>No match found.</Text>
                    </View>}
                  />
                </View>
              )}

              <View style={{ minHeight: getHeightPixel(150), paddingBottom: 10 }}>
                <View style={SignUpStep2Styles.content1}>
                  {
                    <View style={SignUpStep2Styles.tagWrapper}>
                      {selectedItems.map((item, index) => (
                        <View style={SignUpStep2Styles.tagList} key={index}>
                          <ShowInitialsOfName
                            name={item.name}
                            colors={item.color}
                            size={20}
                            radius={20}
                            userId={item?.id}
                            imgUrl={item?.avatar?.url}
                          />
                          <Text style={SignUpStep2Styles.tagListText}>
                            {item.name}
                          </Text>
                          <TouchableWithoutFeedback
                            onPress={
                              () => {
                                selectItems(
                                  selectedItems.filter((i) => i !== item)
                                );
                                InterestsList.current.unshift(item);
                              }

                              //REMOVE ITEM FROM NAMELIST....
                            }
                          >
                            <Icon3 name="close" size={16} color={colors.white} />
                          </TouchableWithoutFeedback>
                        </View>
                      ))}
                    </View>
                  }
                </View>

                <View>
                  <View style={SignUpStep2Styles.tagsContainer}>
                    {tags.map((tag, key) => (
                      <TouchableOpacity
                        key={key.toString()}
                        onPress={() => {
                          //_filterGroup(tag);
                          console.log("Tagger", selectedTags);
                          if (selectedTags.find((item) => item === tag)) {
                            selectTags(
                              selectedTags.filter((item) => item !== tag)
                            );
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
                            ...SignUpStep2Styles.tag,
                            backgroundColor: selectedTags.find(
                              (item) => item === tag
                            )
                              ? colors.accentGray
                              : "white",
                          }}
                        >
                          <Text
                            key={key}
                            style={[
                              SignUpStep2Styles.TagsText,
                              {
                                color: selectedTags.find((item) => item === tag)
                                  ? "white"
                                  : "black",
                              },
                            ]}
                          >
                            {tag
                              .substring(tag.indexOf("-") + 1)
                              .replaceAll("-", " ")}
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
                </View>
              </View>
            </>}
          ListFooterComponent={() =>
            <View style={[SignUpStep2Styles.Button, { paddingBottom: getHeightPixel(30) }]}>
              <ButtonCommon
                title={"CONTINUE"}
                method={checkDate}
                color={colors.primary}
                loading={isLoading}
              />
            </View>}
        />
        {/* <AddInterestsModal modal={setModalVisible} visibility={mVisible} /> */}

        {!open ? null : (
          <DatePicker
            modal
            open={open}
            date={date}
            // fadeToColor="white"
            maximumDate={new Date("2008-01-01")}
            minimumDate={new Date("1950-01-01")}
            textColor={colorScheme == "dark" ? colors.white : colors.black}
            androidVariant="nativeAndroid"
            mode="date"
            onConfirm={(date) => {
              unstable_batchedUpdates(() => {
                setDate(date);
                setOpen(false);
                changeDateDefault(false);
              });
            }}
            onCancel={() => {
              setOpen(!open);
            }}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default SignUpStep2;
