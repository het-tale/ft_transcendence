import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import User from './User';
import Protection from './Protection';


const ProtectPassword = (props: any) =>
{
  return (
  <Protection name="password" child={props.children}/>);
}
      
export default ProtectPassword;