var React = require('react');
var Button = require('react-bootstrap/lib/Button');
var Panel = require('react-bootstrap/lib/Panel');
var ImageGallery = require('react-image-gallery');

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

		var images = [
		  {
		    original: 'assets/img/1.png',
		    thumbnail: 'assets/img/1.png',
		    originalClass: 'featured-slide',
		    thumbnailClass: 'featured-thumb',
		    description: 'Tizzite is an event-oriented social application designed to connect people who are looking for others to do activities with.'
		  },
		  {
		    original: 'assets/img/2.png',
		    thumbnail: 'assets/img/2.png',
				description: 'Search for a location where you wish to host your event'
		  },
		  {
		    original: 'assets/img/3.png',
		    thumbnail: 'assets/img/3.png',
		    description: 'Click on the location and instantly create your event'
		  },
		  {
		    original: 'assets/img/4.png',
		    thumbnail: 'assets/img/4.png',
		    originalClass: 'featured-slide',
		    thumbnailClass: 'featured-thumb',
		    description: 'Your newly created event can viewed by others in real-time'
		  },
		  {
		    original: 'assets/img/5.png',
		    thumbnail: 'assets/img/5.png',
				description: 'A chatroom is available for you and your approved guests to plan your event'
		  },
		  {
		    original: 'assets/img/6.png',
		    thumbnail: 'assets/img/6.png',
		    description: 'Planners can request to join your event'
		  },
		  {
		    original: 'assets/img/7.png',
		    thumbnail: 'assets/img/7.png',
		    originalClass: 'featured-slide',
		    thumbnailClass: 'featured-thumb',
		    description: 'Only approved guests may access event information and chatroom'
		  },
		  {
		    original: 'assets/img/9.png',
		    thumbnail: 'assets/img/9.png',
		    description: 'Chat with other attendee(s) instantly'
		  },
		  {
		    original: 'assets/img/10.png',
		    thumbnail: 'assets/img/10.png',
		    originalClass: 'featured-slide',
		    thumbnailClass: 'featured-thumb',
		    description: 'Recieve instant notifications about new join requests and new messages'
		  },
		  {
		    original: 'assets/img/11.png',
		    thumbnail: 'assets/img/11.png',
				description: 'Plan multiple events and be attendees for multiple events'
		  }
		];

		return (
			<div>
				<Button onClick={this.handlePanel1Button}> What is Tizzite? </Button>
				<Panel collapsible expanded={this.state.isPanel1Open}>
					<p> Tizzite is a traveller`s dream. </p>
					<p> As a Planner, you can create an event by clicking on a location on Google Map. </p>
					<p> After you create an event, an icon will appear on the Google Map for anyone to see </p>
					<p> As a Goer, you are able to see all these events and request to join any event </p>
					<p> If the events Planner approves, you may begin chatting right away! </p>	
					<p> Log in now and start using Tizzite! </p>
	        <div>
	        	<input onClick={this.props.handleFacebookLoginButton} type='image' src='assets/img/facebook-logo.png' style={{height: '48px',width: '48px'}}/>
	        	<input onClick={this.props.handleGoogleLoginButton} id='gplus-login-button' type='image' src='assets/img/google-logo.png' style={{height: '48px',width: '48px'}}/>
	        </div>

					<div className="image-gallery">
						<ImageGallery
				      items={images}
				      autoPlay={false}
				      slideInterval={4000}
				      onSlide={this.handleSlide}/>
				  </div>
				</Panel>
			</div>
		)
	}
})

module.exports = IntroComponent

