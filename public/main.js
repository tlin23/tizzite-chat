// Reuires

var React = require('react');
var ReactDOM = require('react-dom');
var NavbarComponent = require('./NavbarComponent');
var IntroComponent = require('./IntroComponent');
var MapComponent = require('./MapComponent');
var MyEvents = require('./MyEvents')

// Components
// Tizzite Client
var Tizzite = React.createClass({
	// Components: LoginModal, MapComponent
	mixins: [ReactFireMixin],

	getInitialState: function() {
		return {
			firebaseEventsData: [],
			currentUser: {},
			isLoggedIn: false
		};
	},

	componentDidMount: function() {
		this.getLoginRef();
		this.getEventsRef();
		this.handleLoginCallback();
	},

	getLoginRef: function() {
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/");
    this.bindAsObject(ref, "loginRef");
	},

	getEventsRef: function() {
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/")
		this.bindAsArray(ref, "firebaseEventsData");
	},

  createEvent: function(eventName, eventDesc, owner, lat, lng) {
  	var eventsRef = this.firebaseRefs.firebaseEventsData.push({
  		owner: owner,
			eventName: eventName,
			eventDesc: eventDesc,
			lat: lat,
			lng: lng
  	})
  	var eventKey = eventsRef.key()
  	this.createChatroom(eventKey, owner)
  },

	createChatroom: function(eventKey, owner) {
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + eventKey + "/chatroom")
		eventChatroomRef = "firebaseChatroomData" + eventKey
		this.bindAsObject(ref, eventChatroomRef);
		this.firebaseRefs[eventChatroomRef].update({
			owner: owner
		})
	},

	setLoginState: function() {
		var loginAuth = this.firebaseRefs.loginRef.getAuth();
		if (loginAuth.provider.toLowerCase() == 'facebook') {
			var currentUsername =	loginAuth.facebook.displayName;
			var currentUserId = loginAuth.facebook.id;
			var currentUserProfileImageURL = loginAuth.facebook.profileImageURL;
			this.setState({
				currentUser: {
					name            : loginAuth.facebook.displayName,
					id              : loginAuth.facebook.id,
					profileImageURL : loginAuth.facebook.profileImageURL
				},
				isLoggedIn: true
			});
		} else if (loginAuth.provider.toLowerCase() == 'google') {
			var currentUsername =	loginAuth.google.displayName;
			var currentUserId = loginAuth.google.id;
			var currentUserProfileImageURL = loginAuth.google.profileImageURL;
			this.setState({
				currentUser: {
					name            : loginAuth.google.displayName,
					id              : loginAuth.google.id,
					profileImageURL : loginAuth.google.profileImageURL
				},
				isLoggedIn: true
			});
		} else {
			console.log('oops! something went wrong with setLoginState')
		}
	},

	setLogoutState: function() {
		this.setState({
			isLoggedIn: false,
			currentUser: {}
		});
	},

  handleLoginCallback: function(){
  	var that = this;
    var authData = this.firebaseRefs.loginRef.getAuth();
    var authDataCallback = function authDataCallback(authData) {
      if (authData) {
      	that.setLoginState();
        console.log("User " + authData.uid + " is logged in with " + authData.provider);
      } else {
      	that.setLogoutState();
        console.log("User is logged out");
      }
    }
    this.firebaseRefs.loginRef.onAuth(authDataCallback);
  },

  handleFacebookLoginButton: function() {
  	var loginRef = this.firebaseRefs.loginRef
    var isLoggedIn = this.firebaseRefs.loginRef.getAuth();
    if(!isLoggedIn) {
      loginRef.authWithOAuthPopup("facebook", function(error) {
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
  },

  handleGoogleLoginButton: function() {
  	var loginRef = this.firebaseRefs.loginRef
    var isLoggedIn = this.firebaseRefs.loginRef.getAuth();
    if(!isLoggedIn) {
      loginRef.authWithOAuthPopup("google", function(error) {
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
  },

  handleLogoutButton: function() {
  	var loginRef = this.firebaseRefs.loginRef
  	var isLoggedIn = this.firebaseRefs.loginRef.getAuth();
    if(isLoggedIn) {
      console.log("User " + isLoggedIn.uid + " is logged in with " + isLoggedIn.provider);
      loginRef.unauth();
      window.location.reload(true);
      alert('Log out successful!');
    } else {
      console.log("Error: already logged out");
      alert("Error: already logged out");
      // should never get here because logout button shouldn't show
    };
  },

	render: function() {
		if (this.state.isLoggedIn == false) {
			return (
				<div className="chatClient">
					<NavbarComponent isLoggedIn={this.state.isLoggedIn} handleLogoutButton={this.handleLogoutButton} handleFacebookLoginButton={this.handleFacebookLoginButton} handleGoogleLoginButton={this.handleGoogleLoginButton}/>
					<div className='logo-wrapper'>
						<img className='tizzite-logo' src='assets/img/tizzite-logo.png'/>
					</div>
					<div className='intro-wrapper'>
						<IntroComponent handleFacebookLoginButton={this.handleFacebookLoginButton} handleGoogleLoginButton={this.handleGoogleLoginButton}/>
					</div>
				</div>
			)
		} else {
			return (
				<div className="chatClient">
					<NavbarComponent isLoggedIn={this.state.isLoggedIn} handleLogoutButton={this.handleLogoutButton} handleFacebookLoginButton={this.handleFacebookLoginButton} handleGoogleLoginButton={this.handleGoogleLoginButton}/>
					<div className='logo-wrapper'>
						<img className='tizzite-logo' src='assets/img/tizzite-logo.png'/>
					</div>
					<MapComponent currentUser={this.state.currentUser} firebaseEventsData={this.state.firebaseEventsData} createEvent={this.createEvent} createChatroom={this.createChatroom} />
					<MyEvents currentUser={this.state.currentUser} firebaseEventsData={this.state.firebaseEventsData} />
				</div>
			);
		}
	}
});
//////////////////////////////////////////////////////////////////////////////////////////

// // Mount to html
ReactDOM.render(
  <Tizzite />,
  document.getElementById('content')
);
//////////////////////////////////////////////////////////////////////////////////////////