// Reuires

var React = require('react');
var ReactDOM = require('react-dom');
var Modal = require('react-modal');

// Components
// //Chat Client
var ChatClient = React.createClass({
	mixins: [ReactFireMixin],

	getInitialState: function() {
		return {
			fireBaseChatroomData: []
		};
	},

	componentDidMount: function() {
		this.getChatrooms();
		this.handleFacebook();
		this.handleLoginButton();
	},

	getChatrooms: function() {
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/chatrooms/")
		this.bindAsArray(ref, "fireBaseChatroomData");
	},

  handleFacebook: function(){
    var ref = new Firebase("https://tizzite-chat.firebaseio.com/");
    this.bindAsObject(ref, "facebookRef")
    var authData = this.firebaseRefs.facebookRef.getAuth();
    var authDataCallback = function authDataCallback(authData) {
      if (authData) {
        console.log("User " + authData.uid + " is logged in with " + authData.provider);
        $('#fblogin-button').hide()
        $('#fblogout-button').show()
      } else {
        console.log("User is logged out");
        $('#fblogin-button').show()
        $('#fblogout-button').hide()
      }
    }

    ref.onAuth(authDataCallback);
  },

  handleLoginButton: function() {
  	var facebookRef = this.firebaseRefs.facebookRef
    $('#fblogin-button').click(function(){
      var isLoggedIn = facebookRef.getAuth();
      if(!isLoggedIn) {
        facebookRef.authWithOAuthPopup("facebook", function(error) {
          if (error) {
            alert("Login Failed!", error);
          } else {
            // We'll never get here, as the page will redirect on success.
          };
        });
      } else {
        console.log("Error: already logged in");
        alert('Error: already logged in.');
        // should never get here because login button shouldn't show up
      };
    });

	  $('#fblogout-button').click(function(){
	    var isLoggedIn = facebookRef.getAuth();
	    if(isLoggedIn) {
	      console.log("User " + isLoggedIn.uid + " is logged in with " + isLoggedIn.provider);
	      facebookRef.unauth();
	      $('#fblogin-button').show();
	      $('#fblogout-button').hide();
	      window.location.reload(true);
	      alert('Log out successful!');
	    } else {
	      console.log("Error: already logged out");
	      alert("Error: already logged out");
	      // should never get here because logout button shouldn't show
	    };
	  });
  },

	createChatroom: function() {
    var facebookAuth = this.firebaseRefs.facebookRef.getAuth();
		var newPostRef = this.firebaseRefs.fireBaseChatroomData.push({
			owner: facebookAuth.facebook.displayName,
			userId: facebookAuth.facebook.id,
		})

		// var key = newPostRef.key()
		// console.log(key);
	},

	render: function() {
		return (
			<div className="chatClient">
				<FaceBookAuth />
				<CreateChat createChatroom={this.createChatroom} />
				<ChatroomList chatRoomListData={this.state.fireBaseChatroomData}/>
			</div>
		);
	}
});
//////////////////////////////////////////////////////////////////////////////////////////

// // Facebook Log In/Out Button
var FaceBookAuth = React.createClass({
  render: function() {
    return(
	      <div className="faceBookAuth">
	        <button id="fblogin-button"> Facebook Sign In</button>
	        <button id="fblogout-button"> Facebook Sign Out</button>
	      </div>
      )
  }
});
//////////////////////////////////////////////////////////////////////////////////////////

// // Create Chat Button
var CreateChat = React.createClass({
	componentDidMount: function() {
		this.handleCreateChatButton();
	},

	handleCreateChatButton: function() {
		var that = this;
		// random unique id generator
		$('#create-chat').click(function(event) {
			that.props.createChatroom();
		});
	},

	render: function() {
		return(
			<div className="createChat">
				<button id='create-chat'>Create Chat</button>
			</div>				
		);
	}
});
//////////////////////////////////////////////////////////////////////////////////////////

// // List of Chatrooms
var ChatroomList = React.createClass({
	render: function() {
		var inlineStyles = {
			height: '300px',
			overflowY: 'scroll'
		};

		var chatroomNodes = this.props.chatRoomListData.map(function(chatRoom, i) {
			var accessId = chatRoom['.key']
			return (
				<ChatroomListItem owner={chatRoom.owner} accessId={accessId} key={i} />
			);
		});

		return(
			<div className="chatRoomList" style={inlineStyles}>
				{chatroomNodes}
			</div>
		)
	}
});
//////////////////////////////////////////////////////////////////////////////////////////

// // Individual Chatroom inside the Chatroom List
var ChatroomListItem = React.createClass({
	render: function() {
		return (
			<div className="chatRoomListItem">
				<ModalView owner={this.props.owner} accessId={this.props.accessId} />
			</div>
		);
	}
});
//////////////////////////////////////////////////////////////////////////////////////////

// // Modal View
var ModalView = React.createClass({
	getInitialState: function() {
    return { modalIsOpen: false };
  },

  openModal: function() {
    this.setState({modalIsOpen: true});
  },

  closeModal: function() {
    this.setState({modalIsOpen: false});
  },

  render: function() {
	  const customStyles = {
		  content : {
		    top                   : '50%',
		    left                  : '50%',
		    right                 : 'auto',
		    bottom                : 'auto',
		    marginRight           : '-50%',
		    transform             : 'translate(-50%, -50%)'
		  }
		};
    return (
      <div>
        <button onClick={this.openModal}>{this.props.owner} {this.props.accessId}</button>
        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          style={customStyles} >

          <button onClick={this.closeModal}>close</button>
          <Chatroom owner={this.props.owner} accessId={this.props.accessId} />
        </Modal>
      </div>
    );
  }
})
//////////////////////////////////////////////////////////////////////////////////////////

// // Actual Chatroom
var Chatroom = React.createClass({
	mixins: [ReactFireMixin],
  getMessages: function() {
    var ref = new Firebase("https://tizzite-chat.firebaseio.com/chatrooms/" + this.props.accessId + "/messages") 
    this.bindAsArray(ref, "fireBaseMessageData");
  },

  sendMessage: function(message) {
    var that = this;
    var facebookRef = new Firebase("https://tizzite-chat.firebaseio.com/");
    var facebookAuth = facebookRef.getAuth();
    this.firebaseRefs.fireBaseMessageData.push({
      msg: message,
      username: facebookAuth.facebook.displayName,
      userId: facebookAuth.facebook.id,
      profileImgUrl: facebookAuth.facebook.profileImageURL
    });
    // this.setState({message: ""})
  },
  getInitialState: function() {
    return {fireBaseMessageData: []};
  },
  componentDidMount: function() {
    this.getMessages();
    this.handleFacebook
    // You can define pollInterval as a Chatroom attribute in ReactDom.render
    // This will invoke getMessages every defined interval
    // setInterval(this.getMessages, this.props.pollInterval);
  },

	render: function() {
		return(
      <div className="chatRoom">
        <ChatHeader />
          <h2>T-t-t-tizzite! You are a match!</h2>
        <ChatWindow chatWindowData={this.state.fireBaseMessageData}/>
        <ChatForm sendMessage={this.sendMessage} />
      </div>
		);
	}
});
//////////////////////////////////////////////////////////////////////////////////////////

// // Chatroom Header
var ChatHeader = React.createClass({
	mixins: [ReactFireMixin],
  render: function() {
    // Users you are chatting with
    name = 'PLACEHOLDER: User(s) you are chatting with'
    return (
      <div className="msg-wgt-header">
        <a href="#">{name}</a>
      </div>
    );
  }
});
//////////////////////////////////////////////////////////////////////////////////////////

// // Chatroom Messages
var ChatWindow = React.createClass({
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
    // Loop through the list of chats and create array of Message components
    // There needs to be some kind of logic that detects whether the message was sent by you or other people
    var messageNodes = this.props.chatWindowData.map(function(message, i) {
      return (
        <Message username={message.username} key={i} userId={message.userId} message={message.msg} avatar={message.profileImgUrl} />
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
	componentDidMount: function() {
		this.handleSubmitMsgButton();
	},
	handleSubmitMsgButton: function(event) {

	},
  //Message send event handler
  handleUserMessage: function(event) {
    // When shift and enter key is pressed
    if (event.shiftKey && event.keyCode === 13) {
      var msg = ReactDOM.findDOMNode(this.refs.textArea).value.trim();
      if (msg !== '') {
        // call the sendMessage of Chatroom through the props
        // this was passed in from <Chatroom sendMessage={this.sendMessage}>
        this.props.sendMessage(msg);
      }
      // Prevent default and clear the textarea
      event.preventDefault()
      ReactDOM.findDOMNode(this.refs.textArea).value = null;
    } else {
			var that = this
			$('#submit-msg').click(function(){
	      var msg = ReactDOM.findDOMNode(that.refs.textArea).value.trim();
	      if (msg !== '') {
	        // call the sendMessage of Chatroom through the props
	        // this was passed in from <Chatroom sendMessage={this.sendMessage}>
	        that.props.sendMessage(msg);
	      }
	      // Prevent default and clear the textarea
	      ReactDOM.findDOMNode(that.refs.textArea).value = null;
			})
    }
  },
  render: function() {
    return (
      <div className="msg-wgt-footer">
        <textarea id="chatMsg" ref="textArea" onKeyDown={this.handleUserMessage} placeholder="Type your message. Press shift + enter to send" />
        <button id='submit-msg'> Submit </button>
      </div>
    );
  }
});
//////////////////////////////////////////////////////////////////////////////////////////

// // Individual Message
// TODO: time stamp (check http://www.codedodle.com/2015/04/facebook-like-chat-application-react-js.html)
var Message = React.createClass({
  render: function() {
  	var facebookRef = new Firebase("https://tizzite-chat.firebaseio.com/");
    var facebookAuth = facebookRef.getAuth();
    if (this.props.userId == facebookAuth.facebook.id) {
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

// // Mount to html
ReactDOM.render(
  <ChatClient />,
  document.getElementById('content')
);
//////////////////////////////////////////////////////////////////////////////////////////