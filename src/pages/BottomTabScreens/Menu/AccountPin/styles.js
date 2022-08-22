import { StyleSheet } from "react-native";
import colors from "../../../../common/colors";
import { getHeightPixel, getWidthPixel } from "../../../../common/helper";

const styles = StyleSheet.create({
  OTPContainer: {
    width: "80%",
    maxHeight: getHeightPixel(100),
  },
  underlineStyleHighLighted: {
    width: getWidthPixel(40),
    height: getHeightPixel(46),
    borderWidth: 1,
    borderColor: colors.accentGray,
    borderRadius: 6,
    color: colors.black,
  },
  container: {
    alignItems: "center",
  },
  underlineStyleBase: {
    borderColor: colors.black,
    borderWidth: 1,
    borderColor: colors.accentGray,
    borderRadius: 6,
    width: getWidthPixel(40),
    height: getHeightPixel(44),
    color: colors.black,
    fontSize: 18,
  },
  text: {},
  input: {},
  errMsg: {
    color: colors.blockRed,
  },
});

export default styles;
