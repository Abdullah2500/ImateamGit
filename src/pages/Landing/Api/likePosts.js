import axios from "axios";
import { useDispatch } from "react-redux";
import { getToken } from "../../../common/helper";
const likePosts = async (id) => {
  const token = await getToken();
  var url = `https://dev.imateam.us:8443/posts/likes/${id}/`;
  try {
    const response = await axios.post(
      url,
      {},
      {
        headers: { Authorization: token },
      }
    );
    if (response.data.liked_by_me === false) {
      return {
        counter: response.data.liked_count,
        liked_by_me: response.data.liked_by_me,
      };
    } else if (response.data.liked_by_me === true) {
      return {
        counter: response.data.liked_count,
        liked_by_me: response.data.liked_by_me,
      };
    }
  } catch (error) {
    console.log(error);
  }
};

export default likePosts;
