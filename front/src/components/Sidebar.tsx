import React from 'react';
import { Link } from 'react-router-dom';
const Sidebar = () => {
    return (
        <aside>
        <a href="">
            <i className="fa fa-home fa-lg" aria-hidden="true"></i>
          Home
        </a>
        <a href="">
          <i className="fa fa-send fa-lg" aria-hidden="true"></i>
          Chat
        </a>
        <Link to="/game">
          <i className="fa fa-gamepad fa-lg" aria-hidden="true"></i>
          Play
        </Link>
        <a href="">
            <i className="fa fa-user-o fa-lg" aria-hidden="true"></i>
          Profile
        </a>
        <a href="" id="more">
          <i className="fa fa-gear fa-lg" aria-hidden="true"></i>
          More
        </a>
      </aside>
    );
}
export default Sidebar;