var React = require('react');
var Modal = require('react-modal');
var PlannerEventDescription = require('./PlannerEventDescription');
var GoerEventDescription = require('./GoerEventDescription');

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

module.exports = EventModalView;