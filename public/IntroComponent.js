var React = require('react');
var Button = require('react-bootstrap/lib/Button');
var Panel = require('react-bootstrap/lib/Panel');

var IntroComponent = React.createClass({
	getInitialState: function() {
		return ({
			isPanel1Open: true,
			isPanel2Open: false
		})
	},

	handlePanel1Button: function() {
		this.setState({
			isPanel1Open: !this.state.isPanel1Open
		})
	},

	handlePanel2Button: function() {
		this.setState({
			isPanel2Open: !this.state.isPanel2Open
		})
	},

	render: function(){
		return (
			<div>
				<Button onClick={this.handlePanel1Button}> What is Tizzite? </Button>
				<Panel collapsible expanded={this.state.isPanel1Open}>
					<p> Tizzite is a traveller`s dream. </p>
					<p> Tizzite is an event-oriented social application designed to connect people who are looking for others to do activities with. </p>
				</Panel>
				<Button onClick={this.handlePanel2Button}> How to use Tizzite? </Button>
				<Panel collapsible expanded={this.state.isPanel2Open}>
					<p> As a Planner, you can create an event by clicking on a location on Google Map. </p>
					<p> After you create an event, an icon will appear on the Google Map for anyone to see </p>
					<p> As a Goer, you are able to see all these events and request to join any event </p>
					<p> If the events Planner approves, you may begin chatting right away! </p>				
				</Panel>
					<p> Log in now and start using Tizzite! </p>
	        <div>
	        	<input onClick={this.props.handleFacebookLoginButton} type='image' src='assets/img/facebook-logo.png' style={{height: '48px',width: '48px'}}/>
	        	<input onClick={this.props.handleGoogleLoginButton} id='gplus-login-button' type='image' src='assets/img/google-logo.png' style={{height: '48px',width: '48px'}}/>
	        </div>
			</div>
		)
	}
})

module.exports = IntroComponent

