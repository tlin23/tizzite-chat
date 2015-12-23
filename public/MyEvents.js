var React = require('react');
var Chatroom = require('./Chatroom');
var Modal = require('react-modal');
var ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');
var DropdownButton = require('react-bootstrap/lib/DropdownButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var PlannerEventDescription = require('./PlannerEventDescription')

var MyEvents = React.createClass({
	mixins: [ReactFireMixin],

	getInitialState: function() {
		return {
			firebaseEventsData: [],
			isOpen: false
		};
	},

	keepOpen: function(e) {
		this.setState({
			isOpen: true
		})
	},

	closeDropup: function() {
		this.setState({
			isOpen: false
		})
	},

	componentDidMount: function() {
		this.getEvents();
	},

	getEvents: function() {
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/")
		this.bindAsArray(ref, "firebaseEventsData");
	},

  render: function() {
    // Inline styles in React
    var that = this;
    // Loop through the list of chats and create array of Message components
    // There needs to be some kind of logic that detects whether the message was sent by you or other people
    var eventNodes = this.state.firebaseEventsData.map(function(theEvent, i) {
    	var accessId = theEvent['.key']
    	if (theEvent.owner.id == that.props.currentUser.id){
	      return (
	      	<DropdownButton open={that.state.isOpen} onToggle={that.keepOpen} key={i} title={theEvent.eventName} dropup noCaret id="split-button-dropup">
	      			<EventDropup	closeDropup={that.closeDropup}
	      										currentUser={that.props.currentUser} 
														owner={theEvent.owner} 
														eventName={theEvent.eventName} 
														eventDesc={theEvent.eventDesc} 
														accessId={accessId} 
														key={i}/>
	      	</DropdownButton>
	      );
    	}	
    });
    return (
      <div className="eventsList">
        	{eventNodes}
      </div>
    );
  }
})


var EventDropup = React.createClass({
	render: function() {
		return(
			<div>
				<button className='glyphicon glyphicon-remove-circle' onClick={this.props.closeDropup}></button>
				<PlannerEventDescription  currentUser={this.props.currentUser} 
																	owner={this.props.owner} 
																	eventName={this.props.eventName} 
																	eventDesc={this.props.eventDesc} 
																	accessId={this.props.accessId}/>
			</div>
		)
	}
})


module.exports = MyEvents