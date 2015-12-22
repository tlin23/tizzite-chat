var React = require('react');
var ReactDOM = require('react-dom');
var GoogleMap = require('google-map-react');
var Chatroom = require('./Chatroom');
var Modal = require('react-modal');
var CreateEventForm = require('./CreateEventForm')
//////////////////////////////////////////////////////////////////////////////////////////

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

const MARKER_SIZE = 40;
const eventMarkerStyle = {
  position: 'absolute',
  width: MARKER_SIZE,
  height: MARKER_SIZE,
  left: -MARKER_SIZE / 2,
  top: -MARKER_SIZE / 2,
}

// Map Component
var MapComponent = React.createClass({
	mixins: [ReactFireMixin],
	//Props: currentUser
	//Components: CreateEventModal, GoogleMap
	getInitialState: function() {
		return {
			firebaseChatroomData: [],
			firebaseEventsData: [],
			modalIsOpen: false,
			clickedLat: null,
			clickedLng: null,
			searchResult: [],
			mapCenter: this.props.defaultCenter,
			mapZoom: this.props.defaultZoom
		};
	},

	onPlacesChanged: function() {
		// var input = ReactDOM.findDOMNode(this.refs.input);
		// var searchBox = new google.maps.places.Autocomplete(input);
		var places = this.searchBox.getPlaces();
		if (places.length <= 0) {
			alert('Sorry no match found')
		}
		this.setState({
			searchResult: places
		})
	},

	handleSearchBox: function(event) {
		if (event.keyCode === 13) {
			var places = this.searchBox.getPlaces();
			if (places.length <= 0) {
				alert('Sorry no match found')
			}
			this.setState({
				searchResult: places
			})
		}
	},

	clearSearchResult: function() {
		this.setState({
			searchResult: []
		})
	},

	componentDidMount: function() {
		this.getEvents();
		var input = ReactDOM.findDOMNode(this.refs.input);
		this.searchBox = new google.maps.places.SearchBox(input);
		this.searchBox.addListener('places_changed', this.onPlacesChanged);
	},

	componentWillUnmount: function() {
		this.searchBox.removeListener('places_changed', this.onPlacesChanged);
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

	handleMapOnClick: function(clickedEvent) {
		if (clickedEvent.event.target.nodeName.toLowerCase() != 'img') {
			this.setState({
				clickedLat: clickedEvent.lat,
				clickedLng: clickedEvent.lng
			});
			this.openModal();
		} else {
			this.setState({
				mapCenter: {lat: clickedEvent.lat, lng: clickedEvent.lng},
				mapZoom: 14
			})
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
	    zoom: 12
    };
  },

  render: function() {
		var that = this;
		var eventsNodes = this.state.firebaseEventsData.map(function(theEvent, i) {
			var accessId = theEvent['.key']
			return (
				<EventMarker lat={theEvent.lat} 
										 lng={theEvent.lng} 
										 currentUser={that.props.currentUser} 
										 owner={theEvent.owner} 
										 eventName={theEvent.eventName} 
										 eventDesc={theEvent.eventDesc} 
										 accessId={accessId} 
										 key={i} />
			);
		});

		var searchResultNodes = this.state.searchResult.map(function(result, i) {
			var lat = result.geometry.location.lat()
			var lng = result.geometry.location.lng()
			return (
				<SearchResultMarker lat={lat} lng={lng} key={i} />
			);
		})

    return (
    	<div className='map-component-wrapper'>
    		<div className='searchbox-wrapper'>
	    		<input id='searchbox' ref="input" onKeyDown={this.handleSearchBox} style={{float:'left'}} placeholder='Find a place' type="text"/>
	    		<button id='searchResultClear' onClick={this.clearSearchResult} style={{float:'right'}}> Clear </button>
	    	</div>
	    	<div className='map-wrapper'>
	        <Modal
	          isOpen={this.state.modalIsOpen}
	          style={MODALSTYLES} >

	          <button className='glyphicon glyphicon-remove-circle' onClick={this.closeModal}></button>
	          <CreateEventForm lat={this.state.clickedLat} 
	          								 lng={this.state.clickedLng} 
	          								 closeModal={this.closeModal} 
	          								 createEvent={this.createEvent} 
	          								 owner={this.props.currentUser} />
	        </Modal>
		      <GoogleMap
		       	key = {this.props.key}
		       	language = {this.props.language}
		        defaultCenter={this.props.center}
		        center={this.state.mapCenter}
		        defaultZoom={this.props.zoom}
		        zoom={this.state.mapZoom}
		        onChildClick={this.onChildClick}
		        onClick={this.handleMapOnClick}>
		        {searchResultNodes}
		        {eventsNodes}
		      </GoogleMap>
		    </div>
		  </div>
    );
  }
})
//////////////////////////////////////////////////////////////////////////////////////////


var SearchResultMarker = React.createClass({
	render: function() {
		return(
			<div>
				<img className='search-result-marker' src='assets/img/map-icon.png' style={eventMarkerStyle}/>
			</div>
		)
	}
})

// ******* CURRENTLY UNUSED MAY NEED LATER FOR ALTERNATIVE TO CREATING EVENTS ***********
// Create Event Modal View
var CreateEventModalView = React.createClass({
	// Props: 
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

// Event Marker
var EventMarker = React.createClass({
	// Props: lat, lng, currentUser, owner, eventName, eventDesc,accessId, key
	// Components: EventModalView
	render: function() {
		return (
			<div className="eventMarker">
				<EventModalView currentUser={this.props.currentUser} 
												owner={this.props.owner} 
												eventName={this.props.eventName} 
												eventDesc={this.props.eventDesc} 
												accessId={this.props.accessId} />
			</div>
		);
	}
});
///////////////////////////////////////////////////////////////////////////////////////////

// Event Modal View
var EventModalView = React.createClass({
	// Props: currentUsername, owner, eventName, eventDesc, accessId
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
  	if (this.props.currentUser.id == this.props.owner.id) {
  		eventDescriptionElement = <PlannerEventDescription currentUser={this.props.currentUser} owner={this.props.owner} eventName={this.props.eventName} eventDesc={this.props.eventDesc} accessId={this.props.accessId} />
  	} else {
  		eventDescriptionElement = <GoerEventDescription currentUser={this.props.currentUser} owner={this.props.owner} eventName={this.props.eventName} eventDesc={this.props.eventDesc} accessId={this.props.accessId} />
  	}
    return (
      <div className='eventModalView'>
        <img src={this.props.owner.profileImageURL} onClick={this.openModal} style={eventMarkerStyle} />
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
	// Props: currentUsername, owner, eventName, eventDesc, accessId
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
				Planner: {this.props.owner.name}
				<br/>
				Event Name: {this.props.eventName}
				<br/>
				Event Description: {this.props.eventDesc}
				<br/>
				<GoersList firebaseGoersList={this.state.firebaseGoersList} accessId={this.props.accessId} />
				<br/>
				<ChatroomModalView currentUser={this.props.currentUser} owner={this.props.owner} accessId={this.props.accessId} />
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
			if (theGoer.status == 'pending') {
				var goer = {
					name            : theGoer.name,
					id              : theGoer['.key'],
					profileImageURL : theGoer.profileImageURL,
					approvalStatus  : theGoer.status
				}
				return (
					<GoersListItem goer={goer} accessId={that.props.accessId} key={i} />
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
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + this.props.accessId + "/goersList/" + this.props.goer.id)
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
				<a href={this.props.goer.profileImageURL}>
					<img src={this.props.goer.profileImageURL} style={{width: '36px', height: '36px'}}/>
				</a>
				{this.props.goer.name}
				<button className='approve-button'> Yes </button>
				<button className='deny-button'> No </button>
			</div>
		);
	}
});
//////////////////////////////////////////////////////////////////////////////////////////////

// GoerEventDescription
var GoerEventDescription = React.createClass({
	// Props: currentUsername, owner, eventName, eventDesc, accessId
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
  	var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + this.props.accessId + "/goersList/" + this.props.currentUser.id + '/status')
  	this.bindAsObject(ref, "approvalStatus");
  },

  handleRequestJoinButton: function() {
  	var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + this.props.accessId + "/goersList/" + this.props.currentUser.id)
  	this.bindAsObject(ref, "firebaseGoerRequest");
  	var that = this;
		$('#request-to-join').click(function(){
      that.firebaseRefs.firebaseGoerRequest.set({
      	name            : that.props.currentUser.name,
      	profileImageURL : that.props.currentUser.profileImageURL,	
      	status          : 'pending'
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
			chatroomButton = <ChatroomModalView currentUser={this.props.currentUser} owner={this.props.owner} accessId={this.props.accessId} />;
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
				Planner: {this.props.owner.name}
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
	// Props: currentUser, owner, accessId
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
          <Chatroom currentUser={this.props.currentUser}
          	   			owner={this.props.owner}
          	   			accessId={this.props.accessId} />
        </Modal>
      </div>
    );
  }
})
//////////////////////////////////////////////////////////////////////////////////////////

module.exports = MapComponent;