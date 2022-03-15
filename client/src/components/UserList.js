import React, { Component } from "react";
import { ChatList } from "react-chat-elements";
import FormControl from "react-bootstrap/lib/FormControl";
import FormGroup from "react-bootstrap/lib/FormGroup";

 class UserList extends Component {
  state = {
    userData: [],
    searchQuery: null
  };

  searchInput = e => {
    let value = e.target.value;
    if(value){
       this.setState({searchQuery: value});
      }
  }

  getFilteredUserList = ({userData}) => {
    return !this.state.searchQuery ? userData : userData.filter(user =>
          user.name.toLowerCase().includes(this.state.searchQuery.toLowerCase())
       );
  }

  render() {
    const {showSignInList,onChatClicked,onUserClicked} = this.props;

    return (
      <div>
        <FormGroup>
          <FormControl type="text" placeholder="Search for a user here..." onInput={this.searchInput}/>
        </FormGroup>
        {this.getFilteredUserList().length ? (
          <ChatList className={!showSignInList ? "chat-list" : "user-list"}
            dataSource={this.getFilteredUserList().map((f, i) => {
              let date = null;
              let subtitle = "";
              if(!showSignInList && f.messages && f.messages.length){
                let lastMessage = f.messages[f.messages.length - 1];
                date = new Date(lastMessage.timeStamp);
                subtitle = (lastMessage.position === "right" ? "You: " : f.name + ": ") + lastMessage.text;
              }

              return {
                avatar: require(`../photos/${f.id}.jpg`),
                alt: f.name,
                title: f.name,
                subtitle: subtitle,
                date: date,
                unread: f.unread,
                user: f
              };
            })} onClick={ !showSignInList ? onChatClicked : onUserClicked } />
        ) : (
          <div className="text-center no-users">No users to show.</div>
        )}
      </div>
    );
  }
}

export default UserList;