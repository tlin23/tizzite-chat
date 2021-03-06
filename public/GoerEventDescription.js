var React = require('react');
var ChatroomModalView = require('./ChatroomModalView')

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
    this.firebaseRefs.firebaseGoerRequest.set({
      name            : this.props.currentUser.name,
      profileImageURL : this.props.currentUser.profileImageURL, 
      status          : 'pending'
    })

		var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + this.props.accessId);
		ref.update({
			newRequest: true
		})
  },

	render: function() {
		var chatroomButton;
		var currentUserStatus= this.state.approvalStatus['.value']
		if (currentUserStatus == 'approved') {
			//You are either the owner or you've been accepted as an attendee
			// show ChatRoomModalView
			chatroomButton = <ChatroomModalView currentUser={this.props.currentUser} 
																					owner={this.props.owner} 
																					accessId={this.props.accessId} />;
		} else if (currentUserStatus == 'pending' || currentUserStatus == 'denied') {
			// this means you are a goer who has not been accepted yet, show either request or pending button
			// if your id is in the requestingList, show pending
			// other wise, show request button
			// // when the request button is pressed, add id to the requestingList and show pending
			chatroomButton = <button>Pending Approval</button>
		} else {
			chatroomButton = <button id='request-to-join' onClick={this.handleRequestJoinButton}>Request to Join</button>;
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

module.exports = GoerEventDescription;

