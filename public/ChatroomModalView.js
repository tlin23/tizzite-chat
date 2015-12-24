var React = require('react');
var Chatroom = require('./Chatroom');
var Modal = require('react-modal');

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

module.exports = ChatroomModalView;