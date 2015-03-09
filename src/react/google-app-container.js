var url = require('url');
var shell = require('shell');

var GoogleAppContainer = React.createClass({
  componentDidMount: function() {
    var webviews = document.querySelectorAll('webview');
    var forEach = Array.prototype.forEach;

    forEach.call(webviews, function(webview) {
      webview.addEventListener('new-window', function(event) {
        var urlInfo = url.parse(event.url);

        if (urlInfo.hostname.indexOf('google.com') >= 0) {
          window.open(event.url);
        } else {
          shell.openExternal(event.url);
        }
      });
    });
  },

  render: function() {
    var views = this.props.apps.map(function(app) {
      var classes = 'google-app';

      if (this.props.activeLink == app.id) {
        classes += ' active'
      }

      return (
        React.createElement('webview', {
          className: classes,
          src: app.src,
          key: app.id,
        })
      );
    }.bind(this));

    return (
      React.createElement('div', {
        className: 'react-container',
        id: 'google-app-container'
      }, views)
    )
  }
});
