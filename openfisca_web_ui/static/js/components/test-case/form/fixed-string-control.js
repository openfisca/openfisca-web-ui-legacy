/** @jsx React.DOM */
'use strict';


// Disabled input field with a "Modify" button.


var React = require('react');

var CerfaField = require('./cerfa-field');


var FixedStringControl = React.createClass({
  propTypes: {
    cerfaField: React.PropTypes.any,
    error: React.PropTypes.string,
    label: React.PropTypes.component.isRequired,
    name: React.PropTypes.string.isRequired,
    onModifyClick: React.PropTypes.func.isRequired,
    suggestion: React.PropTypes.string,
    suggestionIcon: React.PropTypes.component,
    value: React.PropTypes.string,
  },
  render: function() {
    return (
      <div>
        {this.props.label}
        {! this.props.error && this.props.suggestion && this.props.suggestionIcon}
        <div className='input-group'>
          <span className='input-group-btn'>
            <button className='btn btn-default' onClick={this.props.onModifyClick} type='button'>
              Modifier
            </button>
          </span>
          <input
            className='form-control'
            disabled={true}
            id={this.props.name}
            type='text'
            value={this.props.value}
          />
        </div>
        {
          this.props.cerfaField && (
            <div className='col-md-8'>
              <CerfaField value={this.props.cerfaField} />
            </div>
          )
        }
      </div>
    );
  },
});

module.exports = FixedStringControl;
