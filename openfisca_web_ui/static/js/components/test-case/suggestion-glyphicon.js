/** @jsx React.DOM */
'use strict';

var React = require('react/addons');


var SuggestionGlyphicon = React.createClass({
  propTypes: {
    className: React.PropTypes.string,
  },
  render: function() {
    return (
      <span
        className={React.addons.classSet('glyphicon', 'glyphicon-info-sign', this.props.className)}
        title="Valeur suggérée par le simulateur et utilisée dans ses calculs.">
      </span>
    );
  }
});

module.exports = SuggestionGlyphicon;
