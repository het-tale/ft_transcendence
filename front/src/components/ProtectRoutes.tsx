import { useNavigate } from "react-router-dom"
import React, { useState } from 'react';
import client from "./Client";

const ProtectRoutes = (props : any) => {
  let navigate = useNavigate();
  let [resp, setResp] = useState("");
    client.get("/", {headers: {
        Authorization: 'Bearer ' + localStorage.getItem("token"),
      }}).then((response) => {
        // console.log(response.data);
        setResp(response.data);
      }).catch((error) => {
        navigate("/login");
      })
      console.log(resp);
      return (
        <React.Fragment>
        {
          resp ? props.children : null
      }
        </React.Fragment>
      )
      return null
}

export default ProtectRoutes;