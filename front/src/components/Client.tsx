import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:3001/auth/me"
});

export default client;