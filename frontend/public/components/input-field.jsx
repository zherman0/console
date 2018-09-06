import React, { Component } from 'react';

class InputField extends Component {
    render() {
        return (
            <div className="">
                <label>{this.props.label}</label>
                <input type="text" placeholder='Enter storage class name' onChange={this.props.handleChange}/>
            </div>
        );
    }
}

export default InputField;