import React from "react";
import Navbar from "react-bootstrap/lib/Navbar";

const NavBar = ({signedInUser}) => {
    return (
      <Navbar inverse>
        <Navbar.Header>
          <Navbar.Brand>Cool Chat</Navbar.Brand>
          <Navbar.Toggle />
        </Navbar.Header>
        <Navbar.Collapse>
          <Navbar.Text pullRight>
            Signed in as:&nbsp;
            <span className="signed-in-user">{(signedInUser || {}).name}</span>
          </Navbar.Text>
        </Navbar.Collapse>
      </Navbar>
    );
}

export default NavBar;