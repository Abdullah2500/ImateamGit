import React, { useState, useEffect } from "react";
import {
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/AntDesign";
import colors from "../../../../common/colors";
import styles from "./styles";
import { useGetTeamMembersQuery } from "../../../../Reducers/teamsApi";
import { ShowInitialsOfName } from "../../../../common/Components/ShowInitialsOfName";
import { getHeightPixel, getWidthPixel } from "../../../../common/helper";
import Header from "../../../../common/Components/HeaderCommon";
import { ActivityIndicator } from "react-native-paper";
import { useGetFansQuery } from "../../../../Reducers/usersApi";
import AddTeamMember from "../API/addTeamMembersApi";
import DeleteMember from "../API/deleteTeamMemberApi";
import { getTeamMembersApi, makeAdminApi } from "../API/makeAdminApi";
import TeamLoader from "../TeamProfileImage/TeamLoader";

const TeamDetails = ({ navigation, route }) => {
  const { item } = route.params;
  const {
    data: membersData,
    isFetching,
    refetch,
  } = useGetTeamMembersQuery(item.id);
  const { data: fansData, isFetching: Fetching } = useGetFansQuery(
    item.created_by
  );
  const [selectedMember, selectMember] = useState([]);
  const [memberList, fillMemberList] = useState([]);
  const [searchMember, setMemberSearch] = useState([]);
  const [searchFans, searchInput] = useState("");
  const [isLoader, setIsLoader] = useState(false);
  const [nameSearchQuey, setNameSearchQuery] = useState("");
  const [typeSearchQuey, setTypeSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [connections, setConnections] = useState([]);
  const [filteredFans, setFans] = useState([]);
  const [orgId, setOrgId] = useState("");
  const [userIds, setUserIds] = useState([]);

  const filtered = () => {
    let filteredValues = memberList;
    if (nameSearchQuey) {
      filteredValues = filteredValues.filter((x) =>
        x.user_info.display_name
          .toLowerCase()
          .includes(nameSearchQuey.toLowerCase())
      );
    }
    if (typeSearchQuey) {
      filteredValues = filteredValues.filter((x) =>
        x.payload.memberType
          .toLowerCase()
          .includes(typeSearchQuey.toLowerCase())
      );
    }
    return filteredValues;
  };

  const filterInput = (text, type) => {
    //For Fans
    const myArrayFiltered = connections.filter((el) => {
      return memberList.some((f) => {
        return el.id !== f.id;
      });
    });

    console.log("myArrayFiltered: ", myArrayFiltered);
    const temp = connections.filter((item) => {
      return item.display_info.display_name
        .toLowerCase()
        .includes(text.toLowerCase());
    });
    setFans(temp);
  };

  const addMember = async () => {
    setIsLoader(true);
    let response = await AddTeamMember(item.id, userIds);
    setIsLoader(false);
    if (response.status === 200) {
      console.log("RESP", response);
      refetch();
      setFans([]);
      selectMember([]);
    } else {
      console.log("Error in resp", response);
    }
  };

  const delMember = async (memId) => {
    setIsLoader(true);

    let response = await DeleteMember(item.id, memId);
    setIsLoader(false);

    if (response) {
      console.log("DEL", response);
      refetch();
    } else {
      console.log("DEL error", response);
    }
  };

  const deleteFan = (id, item) => {
    userIds.splice(id, 1);
    selectedMember.splice(id, 1);
    selectMember([...selectedMember]);
    filteredFans.unshift(item);
  };

  const makeAdmin = async (item) => {
    console.log("item ===> ", item);
    setIsLoader(true);
    let bodyData = { admin: item.admin ? false : true, memberId: item.id };
    console.log("bodyData====   >", bodyData);
    let response = await makeAdminApi(item.organization, bodyData);
    setIsLoader(false);
    fillMemberList(response.data);
  };

  const renderMember = (mem, id) => {
    console.log("menber.admin===>", mem.admin);
    // const { item: mem, index: id } = member;
    return (
      <View
        key={id}
        style={[
          styles.member,
          id === 0 && {
            borderTopColor: colors.lightGray,
            borderTopWidth: 0.5,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.memIcon}
          onPress={() => {
            navigation.navigate("GetPostList", {
              id: mem.user_info.id,
              type: "Member",
            });
          }}
        >
          <ShowInitialsOfName
            name={mem.user_info.display_name}
            userId={mem.user_info.id}
            size={40}
            radius={20}
            fontSize={16}
            imgUrl={mem.user_info.avatar.url}
          />
          <Text
            numberOfLines={2}
            style={{ ...styles.text, maxWidth: getWidthPixel(110) }}
          >
            {mem.user_info.display_name}
          </Text>
        </TouchableOpacity>
        {/* User post list details modal */}
        <View style={styles.memType}>
          <Text style={styles.typeText}>{mem.payload.memberType}</Text>
          <Text style={styles.text}>{mem.uploads.length}</Text>
        </View>
        <View style={styles.memButtons}>
          <TouchableOpacity onPress={() => makeAdmin(mem)}>
            <Icon
              name="Safety"
              size={mem.admin ? getHeightPixel(20) : getHeightPixel(18)}
              style={{
                color: mem.admin ? colors.inputBlue : colors.accentGray,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              delMember(mem.user_info.id);
            }}
          >
            <Icon
              name="delete"
              size={getHeightPixel(17)}
              style={styles.deleteIcon}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  const getOrgData = async (id) => {
    console.log("Organ=====>Id", id);
    let response = await getTeamMembersApi(id);
    if (response.data) {
      console.log(
        "response from getMembers Data====>",
        JSON.stringify(response.data)
      );
      fillMemberList(response.data);
    } else {
      console.log("error====>", response);
    }
  };
  useEffect(() => {
    if (!isFetching) {
      if (membersData.length > 0) {
        getOrgData(membersData[0].organization);
      }
      // fillMemberList(membersData);
    }
    if (!Fetching) {
      let fans = fansData?.filter((fan) => {
        return (
          fan.display_info.organization === false &&
          fan.display_info.display_name !=
            memberList.map((x) => x.user_info.display_name)
        );
      });
      setConnections(fans);
    }
  }, [isFetching, Fetching]);

  return (
    <View
      style={{
        backgroundColor: colors.white,
        flexDirection: "column",
        flex: 1,
      }}
    >
      <SafeAreaView>
        <Header heading={`${item.name}`} navigation={navigation} teams={true} />
      </SafeAreaView>
      <ScrollView>
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search Fans..."
            placeholderTextColor={colors.accentGray}
            style={styles.search}
            onChangeText={(e) => {
              searchInput(e);
              filterInput(e, "Fans");
            }}
          />
          <Icon name="search1" style={styles.searchIcon} size={20} />
        </View>
        {/* Search Fans */}

        {searchFans.length ? (
          <View style={styles.connections}>
            {filteredFans.length
              ? filteredFans.map((x, id) => {
                  return (
                    <TouchableOpacity
                      key={id}
                      onPress={() => {
                        setUserIds([...userIds, x.display_info.id]);
                        selectMember([...selectedMember, x]);
                        filteredFans.splice(id, 1);
                        setFans([...filteredFans]);
                      }}
                      style={styles.addMember}
                    >
                      <ShowInitialsOfName
                        size={40}
                        radius={20}
                        fontSize={14}
                        name={x.display_info.display_name}
                        userId={x.display_info.id}
                        imgUrl={x.display_info.avatar.url}
                      />
                      <Text style={styles.fans}>
                        {x.display_info.display_name}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              : null}
          </View>
        ) : null}

        {/* Tag container */}
        {selectedMember.length !== 0 && (
          <ScrollView style={styles.tagWrapper}>
            <View style={styles.tagContainer}>
              {selectedMember.map((item, id) => {
                return (
                  <TouchableOpacity style={styles.fanTag} key={id}>
                    <ShowInitialsOfName
                      size={20}
                      radius={10}
                      fontSize={10}
                      name={item.display_info.display_name}
                      colors={colors.inputBlue}
                      userId={item.display_info.id}
                    />
                    <Text style={{ color: colors.white }}>
                      {item.display_info.display_name}
                    </Text>
                    <TouchableOpacity onPress={() => deleteFan(id, item)}>
                      <Icon name="close" style={styles.deleteIcon1} size={16} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        )}

        {selectedMember.length ? (
          <TouchableOpacity
            onPress={() => {
              addMember();
            }}
            style={styles.addFanBtn}
          >
            <Text style={styles.btnText}>+Add Fans</Text>
          </TouchableOpacity>
        ) : null}

        <View
          style={[
            styles.memberCount,
            !selectedMember.length && { marginTop: 15 },
          ]}
        >
          <Text style={styles.countNum}>
            Members: {item.member_count} total
          </Text>
        </View>
        {/* Name and Type input container */}
        <View style={styles.inputContainer}>
          <View style={styles.searchName}>
            <Text style={styles.text}>Name</Text>
            <TextInput
              style={styles.nameInput}
              placeholder="Name"
              placeholderTextColor={colors.lightSilver}
              onChangeText={(e) => {
                // filterInput(e, "Name")
                setNameSearchQuery(e);
              }}
            />
          </View>
          <View style={styles.searchType}>
            <Text style={styles.text}>Type</Text>
            <TextInput
              style={styles.typeInput}
              placeholder="Type"
              placeholderTextColor={colors.lightSilver}
              onChangeText={(e) => {
                // filterInput(e, "Type")
                setTypeSearchQuery(e);
              }}
            />
            <Icon name="search1" style={styles.searchIcon} size={20} />
          </View>
        </View>
        {/* Members List */}
        <View style={styles.memberContainer}>
          {isFetching ? (
            <ActivityIndicator color={colors.inputBlue} />
          ) : (
            filtered().map((item, id) => renderMember(item, id))
          )}
        </View>
      </ScrollView>
      {isLoader && <TeamLoader />}
    </View>
  );
};

export default TeamDetails;
