import { useNavigate } from "react-router-dom"
import React, { useState } from 'react';
import client from "./Client";
import { error } from "console";

const ProtectRoutes = () => {
    client.get("/", {headers: {
        Authorization: 'Bearer ' + localStorage.getItem("token"),
      }}).then((response) => {
        console.log(response);
      }).catch((error) => {
        console.log(error.response.data.message);
      })
      return null;
}

export default ProtectRoutes;