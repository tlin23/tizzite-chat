var React = require('react');
var ReactDOM = require('react-dom');

// Create Event Form
var CreateEventForm = React.createClass({
	// Props: lat, lng, closeModal,createEvent, owner
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
				that.props.createEvent(eventName, eventDesc, that.props.owner, that.props.lat, that.props.lng);
				that.props.closeModal();
			} else {
				alert('Please enter all fields');
			};
		});
	},

	render: function() {
		return (
			<div className='createEventForm'>
				<p> Planner : {this.props.owner.name} </p>
		    <p> Event Name : <input type='text' id='eventName' ref='eventName'></input> </p>
		    <p> Event Description : <textarea id='eventDesc' ref='eventDesc'></textarea> </p>
		    <button id='create-event'> Create Event </button>
	    </div>
    )
	}
})

module.exports = CreateEventForm;