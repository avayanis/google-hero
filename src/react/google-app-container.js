var url = require('url');
var shell = require('shell');

var GoogleAppContainer = React.createClass({
  componentDidMount: function() {
    var webviews = document.querySelectorAll('webview');
    var forEach = Array.prototype.forEach;

    forEach.call(webviews, function(webview) {
      webview.addEventListener('new-window', function(event) {
        event.stopPropagation();

        var urlInfo = url.parse(event.url);

        if (event.disposition === 'new-window') {
          var targetUrl = event.url;

          if (!urlInfo.hostname) {
            targetUrl = event.srcElement.getUrl().split('#')[0] + event.url;
          }

          // Figure out what we want to do with notifications
          return;
        }

        if (!urlInfo.hostname) {
          // Malformed URL?
          return;
        }

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
