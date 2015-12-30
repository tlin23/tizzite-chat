var React = require('react');
var ReactDOM = require('react-dom');

// // Actual Chatroom
var Chatroom = React.createClass({
	// Props: currentUser, owner, accessId
	// Components: ChatHeader, ChatWindow, ChatForm
	mixins: [ReactFireMixin],

	getInitialState: function() {
		return {
			fireBaseMessageData: [],
			firebaseChattersList: []
		};
	},

  componentDidMount: function() {
    this.getLoginRef();
    this.getMessages();
    this.getChattersList();
    this.getChatterMe();
    // You can define pollInterval as a Chatroom attribute in ReactDom.render
    // This will invoke getMessages every defined interval
    // setInterval(this.getMessages, this.props.pollInterval);
  },

	getChattersList: function() {
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + this.props.accessId + "/chatroom/chatters")
		this.bindAsArray(ref, "firebaseChattersList");
	},

  getChatterMe: function() {
    var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + this.props.accessId + "/chatroom/chatters/" + this.props.currentUser.id)
    this.bindAsObject(ref, "firebaseChatterMe");
  },

  getMessages: function() {
    var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + this.props.accessId + "/chatroom/messages") 
    this.bindAsArray(ref, "fireBaseMessageData");
  },

  getLoginRef: function() {
  	var loginRef = new Firebase("https://tizzite-chat.firebaseio.com/");
    this.bindAsObject(loginRef, "loginRef");
  },

  sendMessage: function(message) {
    var that = this;
    this.firebaseRefs.fireBaseMessageData.push({
      msg: message,
      username: this.props.currentUser.name,
      userId: this.props.currentUser.id,
      profileImgUrl: this.props.currentUser.profileImageURL
    });
    this.pushNewNotificationToAll()
  },

  pushNewNotificationToAll: function() {
    var that = this;
    this.state.firebaseChattersList.map(function(theChatter, i) {
      var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + that.props.accessId + "/chatroom/chatters/" + theChatter.user.id)
      ref.update({
        newMessage: true
      })   
    });
  },

  setNewMessageToFalse: function() {
    this.firebaseRefs.firebaseChatterMe.update({
      newMessage: false
    })
  },

	render: function() {
		return(
      <div className="chatRoom">
        <ChatHeader owner={this.props.owner} firebaseChattersList={this.state.firebaseChattersList}/>
          <h2>T-t-t-tizzite! You are a match!</h2>
        <ChatWindow currentUserId={this.props.currentUser.id} chatWindowData={this.state.fireBaseMessageData}/>
        <ChatForm sendMessage={this.sendMessage} setNewMessageToFalse={this.setNewMessageToFalse}/>
      </div>
		);
	}
});
//////////////////////////////////////////////////////////////////////////////////////////

// // Chatroom Header
var ChatHeader = React.createClass({
	// Props: owner, firebaseChattersList
	getInitialState: function() {
    return { modalIsOpen: false };
  },

  openModal: function() {
    this.setState({modalIsOpen: true});
  },

  closeModal: function() {
    this.setState({modalIsOpen: false});
  },
	// Props: firebaseChattersList
	// Components: a (name)
  render: function() {
    // Users you are chatting with
    // TODO: have each approved goer and owner show up in the header
    var name = [];

    var chatterNodes = this.props.firebaseChattersList.map(function(theChatter, i) {
      return (
        <a href={theChatter.user.profileImageURL} key={i}>
					<img src={theChatter.user.profileImageURL} style={{width: '36px', height: '36px'}}/>
				</a>
      );    		
    });

    return (
      <div className="msg-wgt-header">
  			{chatterNodes}
      </div>
    );
  }
});
//////////////////////////////////////////////////////////////////////////////////////////

// // Chatroom Messages
var ChatWindow = React.createClass({
	// Props: chatWindowData, currentUserId
	// Components: (many) Message
	componentWillUpdate: function() {
		var node = ReactDOM.findDOMNode(this);
		this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
	},
	componentDidUpdate: function() {
		if (this.shouldScrollBottom) {
			var node = ReactDOM.findDOMNode(this);
			node.scrollTop = node.scrollHeight
		}
	},
  render: function() {
    // Inline styles in React
    const inlineStyles = {
      height: '300px',
      overflowY: 'scroll'
    };
    var that = this;
    // Loop through the list of chats and create array of Message components
    // There needs to be some kind of logic that detects whether the message was sent by you or other people
    var messageNodes = this.props.chatWindowData.map(function(message, i) {
      return (
        <Message currentUserId={that.props.currentUserId} username={message.username} key={i} userId={message.userId} message={message.msg} avatar={message.profileImgUrl} />
      );    		
    });
    return (
      <div className="chatWindow" style={inlineStyles}>
        {messageNodes}
      </div>
    );
  }
});
//////////////////////////////////////////////////////////////////////////////////////////

// // Chatroom Input
var ChatForm = React.createClass({
	//Props: sendMessage
	//Components: textarea, button (submit)

  sendMessage: function() {
    var msg = ReactDOM.findDOMNode(this.refs.textArea).value.trim();
    if (msg !== '') {
      // call the sendMessage of Chatroom through the props
      // this was passed in from <Chatroom sendMessage={this.sendMessage}>
      this.props.sendMessage(msg);
    }
    // Prevent default and clear the textarea
    event.preventDefault()
    ReactDOM.findDOMNode(this.refs.textArea).value = null;
  },

  //Message send event handler
  handleKeyboard: function(event) {
    // When shift and enter key is pressed
    if (event.shiftKey && event.keyCode === 13) {
      this.sendMessage();
    } 
    this.props.setNewMessageToFalse()
  },
  
  render: function() {
    return (
      <div className="msg-wgt-footer">
        <textarea id="chatMsg" ref="textArea" onKeyDown={this.handleKeyboard} placeholder="Type your message. Press shift + enter to send" />
        <button id='submit-msg' onClick={this.sendMessage}> Submit </button>
      </div>
    );
  }
});
//////////////////////////////////////////////////////////////////////////////////////////

// // Individual Message
// TODO: time stamp (check http://www.codedodle.com/2015/04/facebook-like-chat-application-react-js.html)
var Message = React.createClass({
	// Props: currentUserId, username, userId, message, avatar
	// Components: img (profileImg), a (username)
  render: function() {
  	var facebookRef = new Firebase("https://tizzite-chat.firebaseio.com/");
    var facebookAuth = facebookRef.getAuth();
    if (this.props.userId == this.props.currentUserId) {
	    return (
	      <div className="my-msg-row-container">
	        <div className="my-msg-row">
	          <div className="my-avatar"><img id='profileImg' src={this.props.avatar}/></div>
	          <span className="my-user-label">
	            <a href="#" className="my-chat-username">{this.props.username}</a>
	          </span><br/>
	          <div className="my-msg-content">{this.props.message}</div>
	        </div>
	      </div>
	    )
    } else {
	    return (
	      <div className="msg-row-container">
	        <div className="msg-row">
	          <div className="avatar"><img id='profileImg' src={this.props.avatar}/></div>
	          <span className="user-label">
	            <a href="#" className="chat-username">{this.props.username}</a>
	          </span><br/>
	          {this.props.message}
	        </div>
	      </div>
	    )
    };
  }
})
//////////////////////////////////////////////////////////////////////////////////////////

module.exports = Chatroom;