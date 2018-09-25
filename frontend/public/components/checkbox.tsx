/* eslint-disable no-undef, no-unused-vars */
import * as React from 'react';

export class Checkbox extends React.Component<CheckboxProps, CheckboxState> {
  constructor(props) {
    super(props);
    this.state = {
      item: {},
      selectedOptions: props.selectedOptions,
    };
  }

  onChange = key => {
    this.props.onChange(key);
  };

  render() {
    return (
      <div className="form-group">
        <div className="checkbox">
          {this.props.title}{' '}
          {this.props.subTitle && (
            <span className="co-no-bold">{this.props.subTitle}</span>
          )}
          <label key={this.props.item.value} className="control-label">
            <input
              className="form-checkbox"
              name={this.props.name}
              onChange={this.onChange}
              value={this.props.item.value}
              checked={
                this.props.selectedOptions.indexOf(this.props.item.value) > -1
              }
              type="checkbox"
            />
            {'  '}
            {this.props.item.label
              ? this.props.item.label
              : this.props.item.value}
          </label>
        </div>
      </div>
    );
  }
}

export type CheckboxState = {
  item: any;
  selectedOptions: any;
};

export type CheckboxProps = {
  explanation?: string;
  name: string;
  title?: string;
  subTitle?: string;
  item: any;
  selectedOptions: any;
  onChange: any;
  checked: boolean;
};
