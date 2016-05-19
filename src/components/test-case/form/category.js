import classNames from 'classNames'
import {Component} from 'react'

export default class Category extends Component {
  propTypes: {
    children: React.PropTypes.arrayOf(React.PropTypes.element).isRequired,
    hasErrors: React.PropTypes.bool,
    hasSuggestions: React.PropTypes.bool,
    index: React.PropTypes.number.isRequired,
    label: React.PropTypes.string.isRequired,
  }
  render() {
    return (
      <div className={classNames('panel', this.props.hasErrors ? 'panel-danger' : 'panel-default')}>
        <div className="panel-heading">
          <h4 className="panel-title">
            {
              this.props.hasSuggestions ? (
                <a
                  data-parent="#accordion"
                  data-toggle="collapse"
                  href={'#category-' + this.props.index}
                  style={{
                    color: 'red',
                    fontStyle: 'italic',
                  }}
                  title={this.getIntlMessage('categoryContainsSuggestions')}>
                  {this.props.label}
                </a>
              ) : (
                <a
                  data-parent="#accordion"
                  data-toggle="collapse"
                  href={'#category-' + this.props.index}>
                  {this.props.label}
                </a>
              )
            }
          </h4>
        </div>
        <div
          className={classNames('panel-collapse', 'collapse', this.props.index === 0 && 'in')}
          id={'category-' + this.props.index}>
          <div className="panel-body">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
