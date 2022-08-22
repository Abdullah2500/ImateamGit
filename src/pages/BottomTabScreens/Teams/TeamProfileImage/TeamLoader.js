import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import colors from "../../../../common/colors";

const TeamLoader = () => {
  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        right: 0,
        left: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      {/* <View style={{
                // backgroundColor: 'white',
                height: 100,
                width: 100,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 20
            }}> */}
      <ActivityIndicator size={"large"} color={"white"} />
      {/* </View> */}
    </View>
  );
};
export default TeamLoader;
