import React from 'react';
import { Link } from 'react-router-dom';
import { BsBoxArrowLeft } from "react-icons/bs";
const Sidebar = () => {
    return (
        <aside>
        <a href="">
            <i className="fa fa-home fa-lg" aria-hidden="true"></i>
          Home
        </a>
        <Link to="/chat/dms">
        {/* <a href=""> */}
          <i className="fa fa-send fa-lg" aria-hidden="true"></i>
          Chat
        {/* </a> */}
        </Link>
        <a href="">
          <i className="fa fa-gamepad fa-lg" aria-hidden="true"></i>
          Play
        </a>
        <a href="">
            <i className="fa fa-user-o fa-lg" aria-hidden="true"></i>
          Profile
        </a>
        <a href="" id="more">
          {/* <i className="fa fa-gear fa-lg" aria-hidden="true"></i> */}
          <BsBoxArrowLeft className='fa'/>
          Log Out
          
        </a>
      </aside>
    );
}
export default Sidebar;