import axios from "axios";
import { getToken } from "../../../../common/helper"

const getUpdatedUserApi = async () => {
    let token = await getToken()
    try {
        let url = `https://dev.imateam.us:8443/accounts/user-info/`
        let headers = {
            Authorization: token
        }
        let options = {
            method: "GET",
            headers: headers,
            url
        }
        let response = await axios(options)
        if (response) {
            return response
        }
    }
    catch (err) {
        return err
    }
}

export default getUpdatedUserApi