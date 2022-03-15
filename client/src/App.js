import React, { Component } from "react";
import axios from "axios";
import io from "socket.io-client";
import {getUsers } from "./requests";

import NavBar from "./components/NavBar";
import Grid from "react-bootstrap/lib/Grid";
import Row from "react-bootstrap/lib/Row";
import Col from "react-bootstrap/lib/Col";
import Modal from "react-bootstrap/lib/Modal";
import UserList from "./components/UserList";
import ChatBox from "./components/ChatBox";
import ErrorModal from "./components/ErrorModal";
import LoadingModal from "./components/LoadingModal";

import "./index.css";
import "react-chat-elements/dist/main.css";
import "react-notifications/lib/notifications.css";
import {NotificationContainer,NotificationManager} from "react-notifications";
const SOCKET_URI = process.env.SERVER_URI;
let socket;

class App extends Component {
  state = {
    signInModalShow: false,
    user: null,
    users: [], 
    userChatData: [], 
    selectedUserIndex: null,
    showChatBox: false, // For small devices only
    showChatList: true, // For small devices only
    error: false,
    errorMessage: ""
  };

  componentDidMount() {
    this.initAxios();
    this.initSocketConnection();
    getUsers().then(users => this.setState({ users, signInModalShow: true }));
    this.setupSocketListeners();
  }

  initSocketConnection(){ socket = io.connect(SOCKET_URI); }

  /**
   *
   * Checks if request from axios fails
   * and if it does then shows error modal.
   */
  initAxios = () => {
    axios.interceptors.request.use(
      config => { 
        this.setState({ loading: true });
        return config;
      },
      error => {
        this.setState({loading: false });
        this.setState({errorMessage: `Couldn't connect to server. try refreshing the page.`, error: true});
        return Promise.reject(error);
      });

    axios.interceptors.response.use(
      response => {
        this.setState({ loading: false });
        return response;
      },
      error => {
        this.setState({ loading: false });
        this.setState({errorMessage: `Some error occured. try after sometime`,error: true});
        return Promise.reject(error);
      });
  }

  /**
   *
   * Shows error if client gets disconnected.
   */
  onClientDisconnected = () => {
    NotificationManager.error("Connection Lost from server please check your connection.","Error!" );
  }

  /**
   *
   * Established new connection if reconnected.
   */
  onReconnection = () => {
    const {user} = this.state;
    if(user){
      socket.emit("sign-in",user);
      NotificationManager.success("Connection Established.", "Reconnected!");
    }
  }

  /**
   *
   * Setup all listeners
   */
  setupSocketListeners = () => {
    socket.on("message", this.onMessageRecieved);
    socket.on("reconnect", this.onReconnection);
    socket.on("disconnect", this.onClientDisconnected);
  }

  /**
   *
   * @param {MessageRecievedFromSocket} message
   *
   * Triggered when message is received.
   * It can be a message from user himself but on different session (Tab).
   * so it decides which is the position of the message "right" or "left".
   *
   * increments unread count and appends in the messages array to maintain Chat History
   */

  onMessageRecieved = (message) => {
    const {userChatData,user,selectedUserIndex} = this.state;
    let messageData = message.message;
    let targetId,targetIndex;
    if(message.from === user.id){
      messageData.position = "right";
      targetId = message.to;
    } else {
      messageData.position = "left";
      targetId = message.from;
    }

    targetIndex = userChatData.findIndex(u => u.id === targetId);
    if(!userChatData[targetIndex].messages){ userChatData[targetIndex].messages = []; }
    if (targetIndex !== selectedUserIndex) {
      if(!userChatData[targetIndex].unread){ userChatData[targetIndex].unread = 0; }
      userChatData[targetIndex].unread++;
    }
    userChatData[targetIndex].messages.push(messageData);
    this.setState({ userChatData });
  }

  /**
   *
   * @param {User} e
   *
   * called when user clicks to sign-in
   */
  onUserClicked = user => {
    socket.emit("sign-in", user);
    let userChatData = this.state.users.filter(u => u.id !== user.id);
    this.setState({ user, signInModalShow: false, userChatData });
  }

  /**
   *
   * @param {ChatItem} e
   *
   * handles if user clickes on ChatItem on left.
   */
  onChatClicked = e => {
    this.toggleViews();
    let users = this.state.userChatData;
    for (let index = 0; index < users.length; index++) {
      if (users[index].id === e.user.id) {
        users[index].unread = 0;
        this.setState({ selectedUserIndex: index, userChatData: users });
        return;
      }
    }
  }

  /**
   *
   * @param {messageText} text
   *
   * creates message in a format in which messageList can render.
   * position is purposely omitted and will be appended when message is received.
   */
  createMessage = (text) => {
    const {user,selectedUserIndex,userChatData} = this.state;
    let message = { 
      to: userChatData[selectedUserIndex].id,
      message: {type: "text",text,date: +new Date(),className: "message"},
      from: user.id
    };
   socket.emit("message", message);
  }

  toggleViews = () => {
    this.setState({
      showChatBox: !this.state.showChatBox,
      showChatList: !this.state.showChatList
    });
  }

  render() {
    const {users,user,error,errorMessage,loading,userChatData,selectedUserIndex,signInModalShow} = this.state;
    let chatBoxProps = this.state.showChatBox ? {xs: 12,sm: 12} : {xsHidden: true, smHidden: true};
    let chatListProps = this.state.showChatList ? {xs: 12,sm: 12} : {xsHidden: true,smHidden: true};

    return (
      <div>
        <NavBar signedInUser={user} />
        <Grid>
          <Row className="show-grid">
            <Col {...chatListProps} md={4}>
              <UserList userData={userChatData} onChatClicked={this.onChatClicked} />
            </Col>
            <Col {...chatBoxProps} md={8}>
              <ChatBox signedInUser={user} onSendClicked={this.createMessage} onBackPressed={this.toggleViews} targetUser={userChatData[selectedUserIndex]} />
            </Col>
          </Row>
        </Grid>

        <Modal show={signInModalShow}>
          <Modal.Header><Modal.Title>Sign In as:</Modal.Title></Modal.Header>
          <Modal.Body>
            <UserList userData={users} onUserClicked={this.onUserClicked} showSignInList/>
          </Modal.Body>
        </Modal>

        <ErrorModal show={error}  errorMessage={errorMessage} />
        <LoadingModal show={loading} />
        <NotificationContainer />
      </div>
    );
  }
}

export default App;
