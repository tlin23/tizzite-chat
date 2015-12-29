var React = require('react');
var Chatroom = require('./Chatroom');
var Modal = require('react-modal');
var Button = require('react-bootstrap/lib/Button');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var PlannerEventDescription = require('./PlannerEventDescription')
var Navbar = require('react-bootstrap/lib/Navbar');

var MyEvents = React.createClass({
	// Props: currentUser, firebaseEventsData
  render: function() {
    // Inline styles in React
    var that = this;
    // Loop through the list of chats and create array of Message components
    // There needs to be some kind of logic that detects whether the message was sent by you or other people
    var eventNodes = this.props.firebaseEventsData.map(function(theEvent, i) {
    	var accessId = theEvent['.key']
    	if (theEvent.owner.id == that.props.currentUser.id){
	      return (
	      			<EventDropupView	closeDropup={that.closeDropup}
			      										currentUser={that.props.currentUser} 
																owner={theEvent.owner} 
																eventName={theEvent.eventName} 
																eventDesc={theEvent.eventDesc} 
																newMessage={theEvent.newMessage}
																newRequest={theEvent.newRequest}
																accessId={accessId} 
																key={i}/>
	      );
    	}	
    });
    return (
      <div className='eventNavBar'>
      	{eventNodes}
      </div>
    );
  }
})


var EventDropupView = React.createClass({
	mixins: [ReactFireMixin],
	getInitialState: function() {
		return {
			isOpen: false,
			wasButtonClicked: false,
			newRequest: this.props.newRequest,
			newMessage: this.props.newMessage
		};
	},

	componentDidMount: function() {
		this.getEventRef();
	},

	getEventRef: function() {
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + this.props.accessId);
		this.bindAsObject(ref, "eventRef");
	},

	openDropup: function(e) {
		if (!this.state.wasButtonClicked){
			this.setState({
				isOpen: true
			})
			this.firebaseRefs.eventRef.update({
				newRequest: false,
				newMessage: false,
			})
		}
	},

	closeDropup: function() {
		this.setState({
			isOpen: false
		})
	},

	handleOnClick: function() {
		this.setState({
			wasButtonClicked: !this.state.wasButtonClicked,
			isOpen:!this.state.isOpen
		});
	},

	render: function() {
		var messageNotification;
		var requestNotification;

		if (this.props.newMessage) {
			messageNotification = <p> New Message! </p>
		}

		if (this.props.newRequest){
			requestNotification = <p> New Request! </p>
		}

		return(
			<div className='eventDropupView'>
				{messageNotification}
				{requestNotification}
				<DropdownButton open={this.state.isOpen} onToggle={this.openDropup} onClick={this.handleOnClick} title={this.props.eventName} dropup noCaret id="split-button-dropup">
					<button className='glyphicon glyphicon-remove-circle' onClick={this.closeDropup}></button>
					<PlannerEventDescription  currentUser={this.props.currentUser} 
																		owner={this.props.owner} 
																		eventName={this.props.eventName} 
																		eventDesc={this.props.eventDesc} 
																		accessId={this.props.accessId}/>
				</DropdownButton>
			</div>
		)
	}
})

module.exports = MyEvents