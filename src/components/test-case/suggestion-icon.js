import {Component} from 'react'

export default class SuggestionIcon extends Component {
  propTypes: {
    children: React.PropTypes.string.isRequired,
  }
  render() {
    var {children, ...otherProps} = this.props;
    return (
      <span
        className='glyphicon glyphicon-info-sign'
        style={{marginLeft: 10}}
        title={children}
        {...otherProps}
      />
    );
  }
}
