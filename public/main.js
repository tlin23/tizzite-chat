// Reuires

var React = require('react');
var ReactDOM = require('react-dom');
var Modal = require('react-modal');


const MODALSTYLES = {
  content : {
    top                   : '50%',
    left                  : '50%',
    right                 : 'auto',
    bottom                : 'auto',
    marginRight           : '-50%',
    transform             : 'translate(-50%, -50%)'
  }
};

// Components
// Tizzite Client
var Tizzite = React.createClass({
	// Components: FacebookAuthButton, CreateModalView, EventsList
	mixins: [ReactFireMixin],

	getInitialState: function() {
		return {
			firebaseChatroomData: [],
			firebaseEventsData: [],
			currentUsername: '',
			currentUserId: '' 
		};
	},

	componentDidMount: function() {
		this.getEvents();
		this.getFacebookAuth();
		this.handleFacebook();
		this.handleLoginButton();
	},

	getEvents: function() {
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/")
		this.bindAsArray(ref, "firebaseEventsData");
	},

	getFacebookAuth: function() {
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/");
    this.bindAsObject(ref, "facebookRef");
	},

	setCurrentUserAndId: function() {
		var facebookAuth = this.firebaseRefs.facebookRef.getAuth();
		var currentUsername =	facebookAuth.facebook.displayName;
		var currentUserId = facebookAuth.facebook.id;
		this.setState({currentUsername: currentUsername});
		this.setState({currentUserId: currentUserId});
	},

  handleFacebook: function(){
  	var that = this;
    var authData = this.firebaseRefs.facebookRef.getAuth();
    var authDataCallback = function authDataCallback(authData) {
      if (authData) {
      	that.setCurrentUserAndId();
        console.log("User " + authData.uid + " is logged in with " + authData.provider);
        $('#fblogin-button').hide()
        $('#fblogout-button').show()
      } else {
        console.log("User is logged out");
        $('#fblogin-button').show()
        $('#fblogout-button').hide()
      }
    }

    this.firebaseRefs.facebookRef.onAuth(authDataCallback);
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

  createEvent: function(eventName, eventDesc) {
  	var eventsRef = this.firebaseRefs.firebaseEventsData.push({
  		owner: this.state.currentUsername,
			ownerId: this.state.currentUserId,
			eventName: eventName,
			eventDesc: eventDesc,
  	})
  	var eventKey = eventsRef.key()
  	this.createChatroom(eventKey)
  },

	createChatroom: function(eventKey) {
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + eventKey + "/chatroom")
		eventChatroomRef = "firebaseChatroomData" + eventKey
		this.bindAsObject(ref, eventChatroomRef);
		this.firebaseRefs[eventChatroomRef].update({
			owner: this.state.currentUsername,
			userId: this.state.currentUserId
		})
	},

	render: function() {
		return (
			<div className="chatClient">
				<FacebookAuthButton />
				
				<CreateEventModalView createEvent={this.createEvent} owner={this.state.currentUsername} ownerId={this.state.currentUserId}/>
				<EventsList eventsListData={this.state.firebaseEventsData} currentUsername={this.state.currentUsername} currentUserId={this.state.currentUserId} />
			</div>
		);

	}
});
//////////////////////////////////////////////////////////////////////////////////////////

var CreateEventModalView = React.createClass({
	// Props: createEvent, owner, ownerId, 
	// Components: button (Create an Event), Modal -> button (close), CreateEventForm
	getInitialState: function() {
		return {modalIsOpen: false};
	},

  openModal: function() {
    this.setState({modalIsOpen: true});
  },

  closeModal: function() {
    this.setState({modalIsOpen: false});
  },
  render: function() {
    return (
      <div>
        <button onClick={this.openModal}> Create an event</button>
        <Modal
          isOpen={this.state.modalIsOpen}
          style={MODALSTYLES} >

          <button onClick={this.closeModal}>close</button>
          <CreateEventForm closeModal={this.closeModal} createEvent={this.props.createEvent} owner={this.props.owner} ownerId={this.props.ownderId} />
        </Modal>
      </div>
    );
  }
})

var CreateEventForm = React.createClass({
	// Props: closeModal, createEvent, owner, ownerId
	// Components: p (Planner), p (Event Name), p (Event Description), button (Create Event)
	componentDidMount: function() {
		this.handleCreateEventButton();
	},

	handleCreateEventButton: function() {
		var that = this;
		$('#create-event').click(function() {
			var eventName = ReactDOM.findDOMNode(that.refs.eventName).value.trim();
			var eventDesc = ReactDOM.findDOMNode(that.refs.eventDesc).value.trim();
			if (eventName !== '' && eventDesc !== '') {
				that.props.createEvent(eventName, eventDesc);
				that.props.closeModal();
			} else {
				alert('Please enter all fields');
			};
		});
	},

	render: function() {
		return (
			<div className='createEventForm'>
				<p> Planner : {this.props.owner} </p>
		    <p> Event Name : <input type='text' id='eventName' ref='eventName'></input> </p>
		    <p> Event Description : <textarea id='eventDesc' ref='eventDesc'></textarea> </p>
		    <button id='create-event'> Create Event </button>
	    </div>
    )
	}
})

var EventModalView = React.createClass({
	// Props: currentUsername, currentUserId, owner, ownerId, eventName, eventDesc, accessId
	// Components: button (Planner, Event ID), Modal -> button (close), EventDescription
	getInitialState: function() {
		return {modalIsOpen: false};
	},

  openModal: function() {
    this.setState({modalIsOpen: true});
  },

  closeModal: function() {
    this.setState({modalIsOpen: false});
  },

  render: function() {
  	var eventDescriptionElement;
  	if (this.props.currentUserId == this.props.ownderId) {
  		eventDescriptionElement = <PlannerEventDescription currentUsername={this.props.currentUsername} currentUserId={this.props.currentUserId} owner={this.props.owner} ownerId={this.props.ownerId} eventName={this.props.eventName} eventDesc={this.props.eventDesc} accessId={this.props.accessId} />
  	} else {
  		eventDescriptionElement = <GoerEventDescription currentUsername={this.props.currentUsername} currentUserId={this.props.currentUserId} owner={this.props.owner} ownerId={this.props.ownerId} eventName={this.props.eventName} eventDesc={this.props.eventDesc} accessId={this.props.accessId} />
  	}
    return (
      <div className='eventModalView'>
        <button onClick={this.openModal}>Planner: {this.props.owner} <br /> Event ID: {this.props.accessId}</button>
        <Modal
          isOpen={this.state.modalIsOpen}
          style={MODALSTYLES} >

          <button onClick={this.closeModal}>close</button>
          {eventDescriptionElement}
        </Modal>
      </div>
    );
  }
})

var PlannerEventDescription = React.createClass({
	// Props: currentUsername, currentUserId, ownerId, eventName, eventDesc, accessId
	// Components: ChatroomModalView
	mixins: [ReactFireMixin],

	getInitialState: function() {
		return {
			modalIsOpen: false,
			approvalStatus: ''
		};
	},

  openModal: function() {
    this.setState({modalIsOpen: true});
  },

  closeModal: function() {
    this.setState({modalIsOpen: false});
  },

	render: function() {
		return (
			<div className="plannerEventDescription">
				{this.props.owner}
				<br/>
				{this.props.ownerId}
				<br/>
				{this.props.eventName}
				<br/>
				{this.props.eventDesc}
				<br/>
				<ChatroomModalView currentUsername={this.props.currentUsername} currentUserId={this.props.currentUserId} owner={this.props.owner} accessId={this.props.accessId} />;
			</div>
		)
	}
})

var GoerEventDescription = React.createClass({
	// Props: currentUsername, currentUserId, ownerId, eventName, eventDesc, accessId
	// Components: ChatroomModalView
	mixins: [ReactFireMixin],

	getInitialState: function() {
		return {
			modalIsOpen: false,
			approvalStatus: ''
		};
	},

	componentDidMount: function() {
		this.getGoerStatus();
		this.handleRequestJoinButton();
	},

  openModal: function() {
    this.setState({modalIsOpen: true});
  },

  closeModal: function() {
    this.setState({modalIsOpen: false});
  },

  getGoerStatus: function() {
  	var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + this.props.accessId + "/goersList/" + this.props.currentUserId + '/status')
  	this.bindAsObject(ref, "approvalStatus");
  },

  handleRequestJoinButton: function() {
  	var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + this.props.accessId + "/goersList/" + this.props.currentUserId)
  	this.bindAsObject(ref, "firebaseGoerRequest");
  	var that = this;
		$('#request-to-join').click(function(){
      that.firebaseRefs.firebaseGoerRequest.set({
      	status : 'pending'
      })
      $('#request-to-join').hide();
		})
  },

	render: function() {
		var chatroomButton;
		var currentUserStatus= this.state.approvalStatus['.value']
		if (currentUserStatus == 'approved') {
			//You are either the owner or you've been accepted as an attendee
			// show ChatRoomModalView
			chatroomButton = <ChatroomModalView currentUsername={this.props.currentUsername} currentUserId={this.props.currentUserId} owner={this.props.owner} accessId={this.props.accessId} />;
		} else if (currentUserStatus == 'pending' || currentUserStatus == 'denied') {
			// this means you are a goer who has not been accepted yet, show either request or pending button
			// if your id is in the requestingList, show pending
			// other wise, show request button
			// // when the request button is pressed, add id to the requestingList and show pending
			chatroomButton = <button>Pending Approval</button>
		} else {
			chatroomButton = <button id='request-to-join'>Request to Join</button>;
		}
		return (
			<div className="goerEventDescription">
				{this.props.owner}
				<br/>
				{this.props.ownerId}
				<br/>
				{this.props.eventName}
				<br/>
				{this.props.eventDesc}
				<br/>
				{chatroomButton}
			</div>
		)
	}
})


// // Facebook Log In/Out Button
var FacebookAuthButton = React.createClass({
	// Props: 
	// Components
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

var EventsList = React.createClass({
	// Props: eventsListData, currentUsername, currentUserId
	// Components: (many) EventsListItem
	render: function() {
		var that = this;
		var inlineStyles = {
			height: '300px',
			overflowY: 'scroll'
		};

		//console.log(this.props.chatroomId)
		var eventsNodes = this.props.eventsListData.map(function(theEvent, i) {
			var accessId = theEvent['.key']
			return (
				<EventsListItem currentUsername={that.props.currentUsername} currentUserId={that.props.currentUserId} owner={theEvent.owner} ownerId={theEvent.ownerId} eventName={theEvent.eventName} eventDesc={theEvent.eventDesc} accessId={accessId} key={i} />
			);
		});

		return(
			<div className="eventsList" style={inlineStyles}>
				{eventsNodes}
			</div>
		)
	}
});

var EventsListItem = React.createClass({
	// Props: currentUsername, currentUserId, owner, ownerId, eventName, eventDesc, accessId
	// Components: EventModalView
	render: function() {
		return (
			<div className="chatRoomListItem">
				<EventModalView currentUsername={this.props.currentUsername} currentUserId={this.props.currentUserId} owner={this.props.owner} ownerId={this.props.ownerId} eventName={this.props.eventName} eventDesc={this.props.eventDesc} accessId={this.props.accessId} />
			</div>
		);
	}
});

// // Chatroom Modal View
var ChatroomModalView = React.createClass({
	// Props: currentUsername, currentUserId, owner, accessId
	// Components: button (Enter Chatroom), Modal -> button (close), Chatroom
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
    return (
      <div>
        <button onClick={this.openModal}>Enter Chatroom</button>
        <Modal
          isOpen={this.state.modalIsOpen}
          style={MODALSTYLES} >

          <button onClick={this.closeModal}>close</button>
          <Chatroom currentUsername={this.props.currentUsername} currentUserId={this.props.currentUserId} owner={this.props.owner} accessId={this.props.accessId} />
        </Modal>
      </div>
    );
  }
})
//////////////////////////////////////////////////////////////////////////////////////////

// // Actual Chatroom
var Chatroom = React.createClass({
	// Props: currentUsername, currentUserId, owner, accessId
	// Components: ChatHeader, ChatWindow, ChatForm
	mixins: [ReactFireMixin],

	getInitialState: function() {
		return {
			fireBaseMessageData: []
		};
	},

  componentDidMount: function() {
    this.getFacebookRef();
    this.getMessages();
    // You can define pollInterval as a Chatroom attribute in ReactDom.render
    // This will invoke getMessages every defined interval
    // setInterval(this.getMessages, this.props.pollInterval);
  },

  getMessages: function() {
    var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + this.props.accessId + "/chatroom/messages") 
    this.bindAsArray(ref, "fireBaseMessageData");
  },

  getFacebookRef: function() {
  	var facebookRef = new Firebase("https://tizzite-chat.firebaseio.com/");
    this.bindAsObject(facebookRef, "facebookRef");
  },

  sendMessage: function(message) {
    var that = this;
    var facebookAuth = this.firebaseRefs.facebookRef.getAuth();
    this.firebaseRefs.fireBaseMessageData.push({
      msg: message,
      username: facebookAuth.facebook.displayName,
      userId: facebookAuth.facebook.id,
      profileImgUrl: facebookAuth.facebook.profileImageURL
    });
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
	// Props:
	// Components: a (name)
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
	// Props: chatWindowData
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
	//Props: sendMessage
	//Components: textarea, button (submit)

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
	// Props: username, userId, message, avatar
	// Components: img (profileImg), a (username)
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
  <Tizzite />,
  document.getElementById('content')
);
//////////////////////////////////////////////////////////////////////////////////////////