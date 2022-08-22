import { StyleSheet } from "react-native";
import colors from "../../../../common/colors";
import {
  getHeightPixel,
  getHeightPercentage,
  getWidthPixel,
  font,
  getWidthPercentage,
} from "../../../../common/helper";
import { getWidthtPixel } from "../screen";

export const SignUpStep2Styles = StyleSheet.create({
  backButtonWrapper: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: getHeightPixel(10),
    marginLeft: 0,
  },
  backButtonText: {
    ...font(18, "700"),
    color: colors.mineShaft,
  },

  container: {
    backgroundColor: colors.white,
    flex: 1,
    paddingLeft: getWidthPixel(40),
    paddingRight: getWidthPixel(40),
  },
  imgWrapper: {
    alignItems: "center",
  },
  img: {
    resizeMode: "contain",
    height: getHeightPixel(250),
    width: getWidthPixel(350),
  },

  Heading: {
    textAlign: "left",
    marginTop: getHeightPixel(26),

    ...font(22, "700"),
    color: colors.mineShaft,
  },
  dob: {
    marginTop: getHeightPixel(26),
    marginBottom: getWidthPixel(7),
    color: colors.mineShaft,
    ...font(14, "600"),
  },
  day: {
    height: getHeightPixel(46),
    backgroundColor: colors.backgroundWhite,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 5,
    marginRight: getWidthPixel(12),
    width: getWidthPixel(80),
    ...font(14, "600"),
    color: colors.mineShaft,
  },
  month: {
    height: getHeightPixel(46),
    backgroundColor: colors.backgroundWhite,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 5,
    marginRight: getWidthPixel(12),
    width: getWidthPixel(101),
    ...font(14, "600"),
    color: colors.mineShaft,
  },

  year: {
    height: getHeightPixel(46),
    backgroundColor: colors.backgroundWhite,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderRadius: 5,
    marginRight: getWidthPixel(12),
    width: getWidthPixel(80),
    ...font(14, "600"),
    color: colors.mineShaft,
  },

  picker: {
    flexDirection: "row",
    width: getWidthPixel(283),

    marginBottom: getWidthPixel(10),
  },
  sports: {
    paddingBottom: getHeightPixel(4),
    ...font(14, "600"),
    color: colors.mineShaft,
  },
  Button: {
    //marginTop: getHeightPixel(30),
    marginBottom: getHeightPixel(50),
  },
  content1: {
    backgroundColor: colors.silverWhite,
    //paddingHorizontal: 17,
    // paddingVertical: 2,
    minHeight: 5,
    backgroundColor: colors.white,
  },
  tagWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tagList: {
    backgroundColor: colors.accentGray,
    flexDirection: "row",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 20,
    alignItems: "center",
    marginLeft: getWidthPixel(6),
    marginVertical: getHeightPixel(5),
  },
  tagListText: {
    marginHorizontal: 5,
    ...font(12, "500"),
    color: colors.white,
  },
  // tagIcon:{
  //   height: getHeightPixel(20),
  //   width: getWidthPixel(20),
  //   borderRadius: 40,
  //   marginVertical: 2,
  //   backgroundColor: item.color,
  // },
  tagIconText: {
    textAlign: "center",
    ...font(14, "bold"),
    color: colors.white,
  },
  interests: {
    zIndex: 1,
  },
  tagsContainer: {
    marginTop: getHeightPixel(6),
    flexDirection: "row",
    flexWrap: "wrap",
    //maxHeight: getHeightPixel(100),
    backgroundColor: colors.white,
  },
  tag: {
    borderRadius: 25,
    height: getHeightPixel(35),
    borderColor: colors.accentGray,

    borderWidth: 1,
    backgroundColor: colors.accentGray,

    paddingLeft: getWidthPixel(10),
    paddingRight: getWidthPixel(10),

    justifyContent: "center",

    alignItems: "center",

    margin: 4,
    flexDirection: "row",
  },
  TagsText: {
    ...font(12, "600"),
    marginRight: 5,
  },
});
