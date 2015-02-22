var React = require('react');

//var view = React.createFactory(require('./view.jsx'));
var view = React.createElement(require('./commentbox.jsx'), { url: "comments.json", pollInterval: 2000 });
React.render(
  view,
  document.getElementById('app')
);
