import React,{Component} from "react";
import Glyphicon from "react-bootstrap/lib/Glyphicon";
import Modal from "react-bootstrap/lib/Modal";

 class ErrorModal extends Component {
  render() {
    const {show,errorMessage} = this.props;

    return (
      <Modal show={show}>
        <Modal.Header><Modal.Title>Error</Modal.Title></Modal.Header>
        <Modal.Body>
          <h1 className="text-center"><Glyphicon glyph="alert" /></h1>
          <h5 className="text-center">{errorMessage}</h5>
        </Modal.Body>
      </Modal>
    );
  }
}

export default ErrorModal;