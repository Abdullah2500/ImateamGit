import axios from "axios";
import { useDispatch } from "react-redux";
import { getToken } from "../../../common/helper";
const likeCommentAPI = async (id) => {
  const token = await getToken();
  var url = `https://dev.imateam.us:8443/comments/likes/${id}/`;
  try {
    const response = await axios.post(
      url,
      {},
      {
        headers: { Authorization: token },
      }
    );

    if (response.data) {
      return response.data;
    }
  } catch (error) {
    console.log(error.response.data);
  }
};

export default likeCommentAPI;
