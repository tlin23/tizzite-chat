var React = require('react');
var Chatroom = require('./Chatroom');
var Modal = require('react-modal');
var ButtonToolbar = require('react-bootstrap/lib/ButtonToolbar');
var SplitButton = require('react-bootstrap/lib/SplitButton');
var MenuItem = require('react-bootstrap/lib/MenuItem');
var PlannerEventDescription = require('./PlannerEventDescription')

var MyEvents = React.createClass({
	mixins: [ReactFireMixin],

	getInitialState: function() {
		return {
			firebaseEventsData: [],
		};
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
	      	<SplitButton key={i} title={theEvent.eventName} dropup id="split-button-dropup">
	      			<PlannerEventDescription currentUser={that.props.currentUser} 
																			 owner={theEvent.owner} 
																			 eventName={theEvent.eventName} 
																			 eventDesc={theEvent.eventDesc} 
																			 accessId={accessId} 
																			 key={i}/>
	      	</SplitButton>
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

module.exports = MyEvents