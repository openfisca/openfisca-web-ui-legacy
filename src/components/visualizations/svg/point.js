import {Component} from 'react'

export default class Point extends Component {
  propTypes: {
    onMouseOver: React.PropTypes.func,
    pointToPixel: React.PropTypes.func.isRequired,
    radius: React.PropTypes.number.isRequired,
    style: React.PropTypes.object,
    x: React.PropTypes.number.isRequired,
    y: React.PropTypes.number.isRequired,
  }
  getDefaultProps() {
    return {
      defaultStyle: {
        fill: 'rgb(166, 50, 50)',
      },
      radius: 5,
    };
  }
  render() {
    var point = this.props.pointToPixel({x: this.props.x, y: this.props.y});
    var style = Lazy(this.props.style).defaults(this.props.defaultStyle).toObject();
    return (
      <circle
        className="point"
        cx={point.x}
        cy={point.y}
        onMouseOver={this.props.onMouseOver}
        r={this.props.radius}
        style={style}
      />
    );
  }
}
