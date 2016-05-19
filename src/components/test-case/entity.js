import classNames from 'classNames'
import {Component} from 'react'

export default class Entity extends Component {
  propTypes: {
    active: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    hasErrors: React.PropTypes.bool,
    id: React.PropTypes.string.isRequired,
    onDelete: React.PropTypes.func.isRequired,
    onEdit: React.PropTypes.func,
  }
  render() {
    return (
      <div className={classNames('panel', this.props.hasErrors ? 'panel-danger' : 'panel-default')}>
        <div className="panel-heading">
          <div className="btn-group">
            <button
              className={classNames('btn', 'btn-default', 'btn-sm', this.props.active ? 'btn-warning' : null)}
              disabled={this.props.disabled}
              onClick={this.props.onEdit}
              type="button">
              {this.props.id}
            </button>
            <button
              className={classNames('btn', 'btn-default', 'btn-sm', 'dropdown-toggle')}
              data-toggle="dropdown"
              disabled={this.props.disabled}
              type="button">
              <span className="caret"></span>
              <span className="sr-only">Toggle Dropdown</span>
            </button>
            {
              ! this.props.disabled && (
                <ul className="dropdown-menu" role="menu">
                  <li>
                    <a href="#" onClick={
                      (event) => {
                        event.preventDefault();
                        if (this.props.onEdit) {
                          this.props.onEdit();
                        }
                      }
                    }>
                      {this.getIntlMessage('edit')}
                    </a>
                    <a href="#" onClick={
                      (event) => {
                        event.preventDefault();
                        this.props.onDelete();
                      }
                    }>
                      {this.getIntlMessage('delete')}
                    </a>
                  </li>
                </ul>
              )
            }
          </div>
        </div>
        <div className="list-group">
          {this.props.children}
        </div>
      </div>
    );
  }
}
