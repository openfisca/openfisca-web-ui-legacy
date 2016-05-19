import {Component} from 'react'

export default class Role extends Component {
  propTypes: {
    disabled: React.PropTypes.bool,
    error: React.PropTypes.string,
    label: React.PropTypes.string.isRequired,
    maxCardinality: React.PropTypes.number,
    onCreateIndividuInEntity: React.PropTypes.func.isRequired,
    role: React.PropTypes.string.isRequired,
  }
  render() {
    var maxCardinality = this.props.maxCardinality;
    return (
      <div className="clearfix list-group-item">
        {
          (
            typeof maxCardinality === 'undefined' || ! this.props.children ||
              this.props.children.length < maxCardinality
          ) && (
            <button
              className='btn btn-default btn-sm pull-right'
              disabled={this.props.disabled}
              onClick={(event) => {
                  event.preventDefault();
                  this.props.onCreateIndividuInEntity();
              }}
            >
              {this.getIntlMessage('add')}
            </button>
          )
        }
        <p>{this.props.label}</p>
        {this.props.error && <p className="text-danger">{this.props.error}</p>}
        {this.props.children}
      </div>
    );
  }
}
