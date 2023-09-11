import client from "../components/Client";
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorToast from "../components/ErrorToast";

const SignIn42 = () => {
    const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

//   useEffect(() => {
    const checkAuthentication42 = async () => {
      try {
        const response = await client.get('/auth/42signin');
        if (response.status === 200) {
            console.log("response.data",response.data);
          setIsLoggedIn(true);
          localStorage.setItem('token', response.data);
          navigate('/home');
        } else {
        //   navigate('/');
        console.log("error");
        }
      } catch (error : any) {
        const errorMessage = error.message;
        setErrorMessage(errorMessage);
        console.log("Erroe",error);
        // navigate('/');
        // <ErrorToast message={errorMessage} />
      }
    };

    checkAuthentication42();
    return null;
//   },[navigate]);

//   if (isLoggedIn) {
//     return <React.Fragment>{props.children}</React.Fragment>;
//   } else {
//     return null;
//   }
};

export default SignIn42;