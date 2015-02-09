/** @jsx React.DOM */
'use strict';

var React = require('react');

var CerfaField = require('./cerfa-field'),
  polyfills = require('../../../polyfills');


var NumberControl = React.createClass({
  propTypes: {
    cerfaField: React.PropTypes.any,
    default: React.PropTypes.number,
    error: React.PropTypes.string,
    label: React.PropTypes.element.isRequired,
    max: React.PropTypes.number,
    min: React.PropTypes.number,
    name: React.PropTypes.string.isRequired,
    onChange: React.PropTypes.func.isRequired,
    suggestion: React.PropTypes.number,
    type: React.PropTypes.string.isRequired,
    value: React.PropTypes.string,
    valType: React.PropTypes.string,
  },
  componentDidMount() {
    this.setState({isValid: polyfills.isValid(this.refs.input.getDOMNode())});
  },
  componentDidUpdate() {
    var isValid = polyfills.isValid(this.refs.input.getDOMNode());
    if (this.state.isValid !== isValid) {
      this.setState({isValid: isValid});
    }
  },
  getInitialState() {
    return {
      isValid: null,
    };
  },
  render() {
    var input = (
      <input
        className="form-control"
        id={this.props.name}
        max={this.props.max}
        min={this.props.min}
        onChange={event => this.props.onChange(event.target.value)}
        placeholder={this.props.suggestion || this.props.default}
        ref='input'
        step={this.props.type === 'Integer' ? 1 : 'any'}
        type="number"
        value={this.props.value}
      />
    );
    return (
      <div>
        {this.props.label}
        <div className="row">
          <div className="col-md-4">
            <div className={this.state.isValid === false ? 'has-error' : null}>
              {
                this.props.valType === 'monetary' ? (
                  <div className="input-group">
                    {input}
                    <span className="input-group-addon">
                      {this.props.valType === 'monetary' && <span className="glyphicon glyphicon-euro"></span>}
                    </span>
                  </div>
                ) : input
              }
            </div>
          </div>
          {
            this.props.cerfaField && (
              <div className="col-md-8">
                <CerfaField value={this.props.cerfaField} />
              </div>
            )
          }
        </div>
      </div>
    );
  }
});

module.exports = NumberControl;
