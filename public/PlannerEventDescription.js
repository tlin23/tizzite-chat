var React = require('react');
var ChatroomModalView = require('./ChatroomModalView')

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
	
	approve: function() {
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + this.props.accessId + "/goersList/" + this.props.goer.id)
		ref.update({
			status : 'approved'
		})
	},

	deny: function() {
		var ref = new Firebase("https://tizzite-chat.firebaseio.com/events/" + this.props.accessId + "/goersList/" + this.props.goer.id)
		ref.update({
			status : 'denied'
		})
	},


	render: function() {
		return (
			<div className="goersListItem">
				<a href={this.props.goer.profileImageURL}>
					<img src={this.props.goer.profileImageURL} style={{width: '36px', height: '36px'}}/>
				</a>
				{this.props.goer.name}
				<button className='approve-button' onClick={this.approve}> Yes </button>
				<button className='deny-button' onClick={this.deny}> No </button>
			</div>
		);
	}
});
//////////////////////////////////////////////////////////////////////////////////////////////

module.exports = PlannerEventDescription;