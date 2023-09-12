import { Link, useNavigate } from 'react-router-dom';
import '../css/login.css';
import client from "../components/Client";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';


function EmailRedirection() {
    let navigate = useNavigate();
    const location = useLocation();
    const Email = async () => {
    const token = location.search.split('=')[1];
        try {

        const response = await client.get("/auth/confirm-email?token=" + token);                 
        if (response.status === 200) {
            navigate('/login');
            // navigate('/complete-profile');
        }
        }
        catch (error : any) {
            const errorMessage = error.response.data.message;
            const errorStatus = error.response.status;
            if (errorMessage === 'email already confirmed' && errorStatus === 403)
            {
                // navigate('/home');
                navigate('/login');
            }
            else
            {
                navigate('/confirm-email');
            }
        }
    };
    useEffect(() => {
const timer = setTimeout(() => {
    Email();
  }, 500);

  return () => {
    clearTimeout(timer);
  };
}, [navigate]);
    return (
        <></>
    );
}

export default EmailRedirection;