var React = require('react');
var ReactDOM = require('react-dom');

// Create Event Form
var CreateEventForm = React.createClass({
	// Props: lat, lng, closeModal,createEvent, owner
	// Components: p (Planner), p (Event Name), p (Event Description), button (Create Event)
	handleCreateEventButton: function() {
		var eventName = ReactDOM.findDOMNode(this.refs.eventName).value.trim();
		var eventDesc = ReactDOM.findDOMNode(this.refs.eventDesc).value.trim();
		if (eventName !== '' && eventDesc !== '') {
			this.props.createEvent(eventName, eventDesc, this.props.owner, this.props.lat, this.props.lng);
			this.props.closeModal();
		} else {
			alert('Please enter all fields');
		};
	},

	render: function() {
		return (
			<div className='createEventForm'>
				<p> Planner : {this.props.owner.name} </p>
		    <p> Event Name : <input type='text' id='eventName' ref='eventName'></input> </p>
		    <p> Event Description : <textarea id='eventDesc' ref='eventDesc'></textarea> </p>
		    <button id='create-event' onClick={this.handleCreateEventButton}> Create Event </button>
	    </div>
    )
	}
})

module.exports = CreateEventForm;