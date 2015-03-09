var GoogleHero = React.createClass({
  getInitialState: function() {
    return {
      activeLink: 'mail'
    }
  },

  getDefaultProps: function() {
    return {
      apps: [{
        id: 'mail',
        src: 'https://mail.google.com'
      },
      {
        id: 'calendar',
        src: 'https://calendar.google.com'
      },
      {
        id: 'drive',
        src: 'https://drive.google.com'
      },
      {
        id: 'groups',
        src: 'https://groups.google.com'
      },
      {
        id: 'contacts',
        src: 'https://www.google.com/contacts/?hl=en&tab=mC#contacts'
      }]
    }
  },

  componentWillMount: function() {
    var body = document.querySelector('body');
    var asciiOffset = 48;

    var testEventForFrameSwitch = function(e) {
      if ((e.which >= '0'.charCodeAt(0) && (e.which <= '9'.charCodeAt(0))) &&
        (e.ctrlKey || e.metaKey)) {
        return true;
      }
    };

    body.addEventListener('keydown', function(event) {
      if (testEventForFrameSwitch(event)) {
        var appIndex = event.which - asciiOffset - 1;

        if (typeof this.props.apps[appIndex] !== 'undefined') {
          var app = this.props.apps[appIndex];

          this.setActiveLink(app.id);
        }
      }
    }.bind(this));
  },

  setActiveLink: function(id) {
    this.setState({
      activeLink: id
    });
  },

  render: function() {
    return (
      <div className="react-container">
        <GoogleAppNavigation apps={this.props.apps} setActiveLink={this.setActiveLink} activeLink={this.state.activeLink} />
        <GoogleAppContainer apps={this.props.apps} activeLink={this.state.activeLink} />
      </div>
    )
  }
});

React.render(
  <GoogleHero />,
  document.getElementById('google-hero')
)
