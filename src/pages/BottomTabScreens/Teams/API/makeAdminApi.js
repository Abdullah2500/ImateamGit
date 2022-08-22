import axios from "axios";
import { getToken } from "../../../../common/helper";

export const makeAdminApi = async (id, body) => {
  const token = await getToken();
  let response = {
    message: "",
    data: null,
    resultCode: 0,
  };
  try {
    const url = `https://dev.imateam.us:8443/organizations/members/${id}/`;
    const config = {
      headers: {
        Authorization: token,
      },
    };
    const result = await axios.put(url, body, config);
    return (response = {
      message: "Success",
      data: result.data,
      resultCode: 200,
    });
  } catch (error) {
    console.log("Error in making admin team: ", error);
    return (response = {
      message: error,
      data: null,
      resultCode: 1,
    });
  }
};
export const getTeamMembersApi = async (id) => {
  const token = await getToken();
  let response = {
    message: "",
    data: null,
    resultCode: 0,
  };
  try {
    const url = `https://dev.imateam.us:8443/organizations/members/${id}/`;
    const config = {
      headers: {
        Authorization: token,
      },
    };
    const result = await axios.get(url, config);
    return (response = {
      message: "Success",
      data: result.data,
      resultCode: 200,
    });
  } catch (error) {
    console.log("Error in making admin team: ", error);
    return (response = {
      message: error,
      data: null,
      resultCode: 1,
    });
  }
};
