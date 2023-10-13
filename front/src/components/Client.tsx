import axios from "axios";

const client = axios.create({
  baseURL: `${process.env.BACKEND_URL}`
});


export default client;