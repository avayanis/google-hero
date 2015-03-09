var GoogleNavItem = React.createClass({
  handleClick: function(event) {
    this.props.onSelect(this.props.id);
    event.preventDefault();
  },

  render: function() {
    var className = this.props.active ? 'active' : null;
    var target = '#' + this.props.id;

    return (
      <li className={className}>
        <a href={target} className='google-app-navigation-link' onClick={this.handleClick}>{this.props.id}</a>
      </li>
    );
  }
});

var GoogleAppNavigation = React.createClass({
  refreshApps: function() {
    var webviews = document.querySelectorAll('webview');
    var forEach = Array.prototype.forEach;

    forEach.call(webviews, function(webview) {
      webview.reload();
    });
  },

  render: function() {
    var navItems = this.props.apps.map(function(app) {
      return (
        GoogleNavItem({
          active: (this.props.activeLink === app.id),
          key: app.id,
          onSelect: this.props.setActiveLink,
          id: app.id
        })
      );
    }.bind(this));

    return(
      <nav className='navbar navbar-inverse navbar-fixed-top' role='navigation'>
        <div className='container-fluid'>
          <div className='navbar-header'>
            <a className='navbar-brand' target='_blank' href='https://github.com/avayanis/google-hero'>Google Hero</a>
          </div>
          <div className='navbar-collapse collapse'>
            <ul className='nav navbar-nav'>
              {navItems}
            </ul>
            <ul className='nav navbar-nav navbar-right'>
              <li><a href='#logout' title='Log Out'><span className='glyphicon glyphicon-log-out' onClick={this.logout}></span></a></li>
              <li><a href='#refresh' title='Refresh'><span className='glyphicon glyphicon-refresh' onClick={this.refreshApps}></span></a></li>
            </ul>
          </div>
        </div>
      </nav>
    )
  }
});
