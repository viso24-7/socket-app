import React, { Component } from "react";
import Glyphicon from "react-bootstrap/lib/Glyphicon";
import Modal from "react-bootstrap/lib/Modal";

 class LoadingModal extends Component {
  render() {
    const {show} = this.props;

    return (
      <Modal show={show}>
        <Modal.Body>
          <h1 className="text-center"><Glyphicon glyph="refresh" /></h1>
          <h5 className="text-center">Loading...</h5>
        </Modal.Body>
      </Modal>
    );
  }
}
export default LoadingModal;