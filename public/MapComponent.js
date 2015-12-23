var React = require('react');
var ReactDOM = require('react-dom');
var Modal = require('react-modal');
var GoogleMap = require('google-map-react');
var CreateEventForm = require('./CreateEventForm');
var PlannerEventDescription = require('./PlannerEventDescription')
var GoerEventDescription = require('./GoerEventDescription')

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
	//Props: currentUser
	//Components: CreateEventModal, GoogleMap
	getInitialState: function() {
		return {
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
		var input = ReactDOM.findDOMNode(this.refs.input);
		this.searchBox = new google.maps.places.SearchBox(input);
		this.searchBox.addListener('places_changed', this.onPlacesChanged);
	},

	componentWillUnmount: function() {
		this.searchBox.removeListener('places_changed', this.onPlacesChanged);
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

	handleMapOnClick: function(clickedEvent) {
		if (clickedEvent.event.target.nodeName.toLowerCase() != 'img') {
			this.setState({
				clickedLat: clickedEvent.lat,
				clickedLng: clickedEvent.lng,
				mapCenter: {lat: clickedEvent.lat, lng: clickedEvent.lng},
				mapZoom: 14
			});
			this.openModal();
		} else {
			this.setState({
				mapCenter: {lat: clickedEvent.lat, lng: clickedEvent.lng},
				mapZoom: 14
			})
		}
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
		var eventsNodes = this.props.firebaseEventsData.map(function(theEvent, i) {
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
	          								 createEvent={this.props.createEvent} 
	          								 owner={this.props.currentUser} />
	        </Modal>
		      <GoogleMap
		       	key = {this.props.key}
		       	language = {this.props.language}
		        defaultCenter={this.props.center}
		        center={this.state.mapCenter}
		        defaultZoom={this.props.zoom}
		        zoom={this.state.mapZoom}
		        onClick={this.handleMapOnClick}>
		        {searchResultNodes}
		        {eventsNodes}
		      </GoogleMap>
		    </div>
		  </div>
    );
  }
})
//////////////////////////////////////////////////////f////////////////////////////////////


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
	// Props: currentUser, owner, eventName, eventDesc, accessId
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


module.exports = MapComponent;