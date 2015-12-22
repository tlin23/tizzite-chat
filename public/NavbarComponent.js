var React = require('react');
var Modal = require('react-modal');
var Navbar = require('react-bootstrap/lib/Navbar');
var Nav = require('react-bootstrap/lib/Nav');
var NavItem = require('react-bootstrap/lib/NavItem');
var NavDropdown = require('react-bootstrap/lib/NavDropdown');
var MenuItem = require('react-bootstrap/lib/MenuItem');

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


var NavbarComponent = React.createClass({
	render: function() {
		var loginButton;
		if (this.props.isLoggedIn == false) {
			loginButton = <LoginModal handleFacebookLoginButton={this.props.handleFacebookLoginButton} handleGoogleLoginButton={this.props.handleGoogleLoginButton} />
		} else {
			loginButton = <p onClick={this.props.handleLogoutButton}> LOG OUT </p>
		}
		return(
		  <Navbar inverse>
		    <Navbar.Header>
		      <Navbar.Toggle />
		    </Navbar.Header>
		    <Navbar.Collapse>
		      <Nav pullRight>
		        <NavItem eventKey={1} href="#">{loginButton}</NavItem>
		      </Nav>
		    </Navbar.Collapse>
		  </Navbar>
		)
	}
})

// LoginModal
var LoginModal = React.createClass({
	// Props: handleFacebookLoginButton, handleGoogleLoginButton
	// Components: Login Button/Modal
	getInitialState: function() {
		return {
			modalIsOpen: false
		}
	},

  openModal: function() {
    this.setState({modalIsOpen: true});
  },

  closeModal: function() {
    this.setState({modalIsOpen: false});
  },
  render: function() {
  	return (
  		<div className='loginModal'>
	  		<p onClick={this.openModal}> LOG IN </p>
	      <Modal
	        isOpen={this.state.modalIsOpen}
	        style={MODALSTYLES} >

	        <button className='glyphicon glyphicon-remove-circle' onClick={this.closeModal}></button>
	        <div>
	        	<input onClick={this.props.handleFacebookLoginButton} type='image' src='assets/img/facebook-logo.png' style={{height: '48px',width: '48px'}}/>
	        	<input onClick={this.props.handleGoogleLoginButton} id='gplus-login-button' type='image' src='assets/img/google-logo.png' style={{height: '48px',width: '48px'}}/>
	        </div>
	      </Modal>
      </div>
  	)
  }
});

module.exports = NavbarComponent;