// Reuires

var React = require('react');
var ReactDOM = require('react-dom');
var Modal = require('react-modal');
var GoogleMap = require('google-map-react');

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
			currentUsername: '',
			currentUserId: '',
			isLoggedIn: false
		};
	},

	componentDidMount: function() {
		this.getFacebookAuth();
		this.handleFacebook();
		this.handleLoginButton();
	},

	getFacebookAuth: function() {
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/");
    this.bindAsObject(ref, "facebookRef");
	},

	setLoginState: function() {
		var facebookAuth = this.firebaseRefs.facebookRef.getAuth();
		var currentUsername =	facebookAuth.facebook.displayName;
		var currentUserId = facebookAuth.facebook.id;
		this.setState({
			currentUsername: currentUsername,
			currentUserId: currentUserId,
			isLoggedIn: true
		});
	},

	setLogoutState: function() {
		this.setState({
			isLoggedIn: false
		});
	},

  handleFacebook: function(){
  	var that = this;
    var authData = this.firebaseRefs.facebookRef.getAuth();
    var authDataCallback = function authDataCallback(authData) {
      if (authData) {
      	that.setLoginState();
        console.log("User " + authData.uid + " is logged in with " + authData.provider);
        $('#fblogin-button').hide()
        $('#fblogout-button').show()
      } else {
      	that.setLogoutState();
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

	render: function() {
		const LOGOSTYLE = {
			margin : '0 300px',
			clear  : 'left',
		}
		if (this.state.isLoggedIn == false) {
			return (
				<div className="chatClient">
					<FacebookAuthButton />
				</div>
			)
		} else {
			return (
				<div className="chatClient">
					<FacebookAuthButton />
					<img src='assets/img/tizzite-logo.png' style={{margin : 'relative relative relative relative'}} />
					<MapComponent currentUsername={this.state.currentUsername} currentUserId={this.state.currentUserId}/>
				</div>
			);
		}
	}
});
//////////////////////////////////////////////////////////////////////////////////////////

var LoginModal = React.createClass({
	getInitialState: function() {
		return {
			modalIsOpen: false
		}
	},
  openModal: function() {
    this.setState({modalIsOpen: true});
  },

  closeModal: function() {
    this.setState({modalIsOpen: false});
  },
  render: function() {
  	return (
  		<div className='loginModal'>
	  		<button onClick={this.openModal}> Login </button>
	      <Modal
	        isOpen={this.state.modalIsOpen}
	        style={MODALSTYLES} >

	        <button className='glyphicon glyphicon-remove-circle' onClick={this.closeModal}></button>
	        <div>
	        	<input type='image' src='assets/img/facebook-logo.png' style={{height: '48px',width: '48px'}}/>
	        	<input type='image' src='assets/img/google-logo.png' style={{height: '48px',width: '60px'}}/>
	        </div>
	      </Modal>
      </div>
  	)
  }
});

var MapComponent = React.createClass({
	mixins: [ReactFireMixin],
	//Props: createEvent, owner, ownerId
	getInitialState: function() {
		return {
			firebaseChatroomData: [],
			firebaseEventsData: [],
			modalIsOpen: false,
			clickedLat: null,
			clickedLng: null
		};
	},

	componentDidMount: function() {
		this.getEvents();
	},

	getEvents: function() {
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/")
		this.bindAsArray(ref, "firebaseEventsData");
	},

  openModal: function() {
    this.setState({modalIsOpen: true});
  },

  closeModal: function() {
    this.setState({
    	modalIsOpen: false,
			clickedLat: null,
			clickedLng: null
    });
  },

  createEvent: function(eventName, eventDesc, owner, ownerId, lat, lng) {
  	var eventsRef = this.firebaseRefs.firebaseEventsData.push({
  		owner: owner,
			ownerId: ownerId,
			eventName: eventName,
			eventDesc: eventDesc,
			lat: lat,
			lng: lng
  	})
  	var eventKey = eventsRef.key()
  	this.createChatroom(eventKey)
  },

	createChatroom: function(eventKey) {
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + eventKey + "/chatroom")
		eventChatroomRef = "firebaseChatroomData" + eventKey
		this.bindAsObject(ref, eventChatroomRef);
		this.firebaseRefs[eventChatroomRef].update({
			owner: this.props.currentUsername,
			userId: this.props.currentUserId
		})
	},

	handleMapOnClick: function(clickedEvent) {
		if (clickedEvent.event.target.nodeName.toLowerCase() != 'img') {
			this.setState({
				clickedLat: clickedEvent.lat,
				clickedLng: clickedEvent.lng
			});
			this.openModal();
		}
	},

	onChildClick: function(key, childProps) {
		console.log(childProps)
	},

  getDefaultProps: function() {
    return {
    	key: 'AIzaSyAC_GzpyatkGZlZYLCfTKhiLsYcsei1Xas',
    	language: 'eng',
	    center: {lat: 49.2827, lng: -123.1207},
	    zoom: 12,
	    greatPlaceCoords: {lat: 49.2827, lng: -123.1207}
    };
  },

  render: function() {
		const MAPSTYLE = {
		    width: '1000px',
		    height: '600px',
		    margin: '10px 10px 10px 10px',
		};

		var that = this;
		var eventsNodes = this.state.firebaseEventsData.map(function(theEvent, i) {
			var accessId = theEvent['.key']
			return (
				<EventMarker lat={theEvent.lat} lng={theEvent.lng} currentUsername={that.props.currentUsername} currentUserId={that.props.currentUserId} owner={theEvent.owner} ownerId={theEvent.ownerId} eventName={theEvent.eventName} eventDesc={theEvent.eventDesc} lat={theEvent.lat} lng={theEvent.lng} accessId={accessId} key={i} />
			);
		});

    return (
    	<div style={MAPSTYLE}>
        <Modal
          isOpen={this.state.modalIsOpen}
          style={MODALSTYLES} >

          <button className='glyphicon glyphicon-remove-circle' onClick={this.closeModal}></button>
          <CreateEventForm lat={this.state.clickedLat} lng={this.state.clickedLng} closeModal={this.closeModal} createEvent={this.createEvent} owner={this.props.currentUsername} ownerId={this.props.currentUserId} />
        </Modal>
	      <GoogleMap
	       	key = {this.props.key}
	       	language = {this.props.language}
	        defaultCenter={this.props.center}
	        defaultZoom={this.props.zoom}
	        onChildClick={this.onChildClick}
	        onClick={this.handleMapOnClick}>
	        {eventsNodes}
	      </GoogleMap>
	    </div>
    );
  }
})

// // Facebook Log In/Out Button
var FacebookAuthButton = React.createClass({
	// Props: 
	// Components
  render: function() {
    return(
	      <div className="faceBookAuth">
	        <input type='image' id="fblogin-button" src='assets/img/facebook-logo.png' style={{height: '48px', width: '48px'}}/>
	        <button type="button" className="btn btn-default" aria-label="Left Align" id="fblogout-button">
	        	<span className="glyphicon glyphicon-log-out" aria-hidden="true"></span>
	        </button>
	      </div>
      )
  }
});
//////////////////////////////////////////////////////////////////////////////////////////

// Create Event Modal View
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

          <button className='glyphicon glyphicon-remove-circle' onClick={this.closeModal}></button>
          <CreateEventForm closeModal={this.closeModal} createEvent={this.props.createEvent} owner={this.props.owner} ownerId={this.props.ownderId} />
        </Modal>
      </div>
    );
  }
})
///////////////////////////////////////////////////////////////////////////////////////////////////////////

// Create Event Form
var CreateEventForm = React.createClass({
	// Props: closeModal, createEvent, owner, ownerId, lat, lng
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
				that.props.createEvent(eventName, eventDesc, that.props.owner, that.props.ownerId, that.props.lat, that.props.lng);
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
/////////////////////////////////////////////////////////////////////////////////////////////////

// Events List Item
var EventMarker = React.createClass({
	// Props: currentUsername, currentUserId, owner, ownerId, eventName, eventDesc, lat, lng accessId
	// Components: EventModalView
	render: function() {
		return (
			<div className="chatRoomListItem">
				<EventModalView currentUsername={this.props.currentUsername} currentUserId={this.props.currentUserId} owner={this.props.owner} ownerId={this.props.ownerId} eventName={this.props.eventName} eventDesc={this.props.eventDesc} accessId={this.props.accessId} />
			</div>
		);
	}
});
///////////////////////////////////////////////////////////////////////////////////////////

// Event Modal View
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
  	if (this.props.currentUserId == this.props.ownerId) {
  		eventDescriptionElement = <PlannerEventDescription currentUsername={this.props.currentUsername} currentUserId={this.props.currentUserId} owner={this.props.owner} ownerId={this.props.ownerId} eventName={this.props.eventName} eventDesc={this.props.eventDesc} accessId={this.props.accessId} />
  	} else {
  		eventDescriptionElement = <GoerEventDescription currentUsername={this.props.currentUsername} currentUserId={this.props.currentUserId} owner={this.props.owner} ownerId={this.props.ownerId} eventName={this.props.eventName} eventDesc={this.props.eventDesc} accessId={this.props.accessId} />
  	}
    return (
      <div className='eventModalView'>
        <img src='assets/img/map-icon.png' onClick={this.openModal} height='36px' width='36px'/>
        <Modal
          isOpen={this.state.modalIsOpen}
          style={MODALSTYLES} >

          <button className='glyphicon glyphicon-remove-circle' onClick={this.closeModal}></button>
          {eventDescriptionElement}
        </Modal>
      </div>
    );
  }
})
/////////////////////////////////////////////////////////////////////////////////////////////////////

// Planner Event Description
var PlannerEventDescription = React.createClass({
	// Props: currentUsername, currentUserId, owner, ownerId, eventName, eventDesc, accessId
	// Components: ChatroomModalView
	mixins: [ReactFireMixin],

	getInitialState: function() {
		return {
			modalIsOpen: false,
			firebaseGoersList: []
		};
	},

	componentDidMount: function() {
		this.getGoersList();
	},

	getGoersList: function() {
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + this.props.accessId + "/goersList")
		this.bindAsArray(ref, "firebaseGoersList");
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
				Planner: {this.props.owner}
				<br/>
				Event Name: {this.props.eventName}
				<br/>
				Event Description: {this.props.eventDesc}
				<br/>
				<GoersList firebaseGoersList={this.state.firebaseGoersList} accessId={this.props.accessId} />
				<br/>
				<ChatroomModalView currentUsername={this.props.currentUsername} currentUserId={this.props.currentUserId} owner={this.props.owner} ownerId={this.props.ownerId} accessId={this.props.accessId} />
			</div>
		)
	}
})
//////////////////////////////////////////////////////////////////////////////////////////////////

// Goers List
var GoersList = React.createClass({
	// Props: firebaseGoersList, accessId
	// Components: (many) GoersListItem
	render: function() {
		var that = this;
		var inlineStyles = {
			height: '100px',
			overflowY: 'scroll'
		};
		var goersNodes = this.props.firebaseGoersList.map(function(theGoer, i) {
			var goerId = theGoer['.key']
			var goerApprovalStatus = theGoer['status']
			if (goerApprovalStatus == 'pending') {
				return (
					<GoersListItem goerId={goerId} goerApprovalStatus={goerApprovalStatus} accessId={that.props.accessId} key={i} />
				);
			}
		});

		return(
			<div className="goerList" style={inlineStyles}>
				{goersNodes}
			</div>
		)
	}
});
//////////////////////////////////////////////////////////////////////////////////////////

// Goers List Item
var GoersListItem = React.createClass({
	// Props: goerId, goerApprovalStatus, accessId
	// Components:
	
	componentDidMount: function() {
		this.handleApprovalButtons();
	},


	handleApprovalButtons: function() {
		var that = this;
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + this.props.accessId + "/goersList/" + this.props.goerId)
		$('.approve-button').click(function(event){
				ref.update({
					status : 'approved'
				})
    	})
		$('.deny-button').click(function(event){
				ref.update({
					status : 'denied'
				})
    	})
	},


	render: function() {
		return (
			<div className="goersListItem">
				{this.props.goerId}
				<button className='approve-button'> Yes </button>
				<button className='deny-button'> No </button>
			</div>
		);
	}
});
//////////////////////////////////////////////////////////////////////////////////////////////

// GoerEventDescription
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
      // $('#request-to-join').hide();
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
				Planner: {this.props.owner}
				<br/>
				EventName: {this.props.eventName}
				<br/>
				Event Description: {this.props.eventDesc}
				<br/>
				{chatroomButton}
			</div>
		)
	}
})
//////////////////////////////////////////////////////////////////////////////////////////////


// // Chatroom Modal View
var ChatroomModalView = React.createClass({
	// Props: currentUsername, currentUserId, owner, ownerId, accessId
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

          <button className='glyphicon glyphicon-remove-circle' onClick={this.closeModal}></button>
          <Chatroom currentUsername={this.props.currentUsername} currentUserId={this.props.currentUserId} owner={this.props.owner} ownerId={this.props.ownerId} accessId={this.props.accessId} />
        </Modal>
      </div>
    );
  }
})
//////////////////////////////////////////////////////////////////////////////////////////

// // Actual Chatroom
var Chatroom = React.createClass({
	// Props: currentUsername, currentUserId, owner, ownerId, accessId
	// Components: ChatHeader, ChatWindow, ChatForm
	mixins: [ReactFireMixin],

	getInitialState: function() {
		return {
			fireBaseMessageData: [],
			firebaseGoersList: []
		};
	},

  componentDidMount: function() {
    this.getFacebookRef();
    this.getMessages();
    this.getGoersList();
    // You can define pollInterval as a Chatroom attribute in ReactDom.render
    // This will invoke getMessages every defined interval
    // setInterval(this.getMessages, this.props.pollInterval);
  },

	getGoersList: function() {
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + this.props.accessId + "/goersList")
		this.bindAsArray(ref, "firebaseGoersList");
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
        <ChatHeader firebaseGoersList={this.state.firebaseGoersList}/>
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
	// Props: firebaseGoersList
	// Components: a (name)
  render: function() {
    // Users you are chatting with
    // TODO: have each approved goer and owner show up in the header
    var name = [];

    var goerNodes = this.props.firebaseGoersList.map(function(theGoer, i) {
      return (
        <a key={i}> {theGoer['.key']} </a>
      );    		
    });

    return (
      <div className="msg-wgt-header">
  			I am place holder
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