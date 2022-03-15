import axios from 'axios';
const API_ROOT = process.env.REACT_APP_SERVER_URI
axios.defaults.baseURL = API_ROOT;

export const getUsers = () => {
    return axios.get(`/users`).then(res => res.data.data)
}