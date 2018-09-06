import * as _ from "lodash-es";
import * as React from "react";
import {
  Wizard,
  Form,
  Col,
  FormControl,
  FormGroup,
  ControlLabel,
  HelpBlock,
  Alert
} from "patternfly-react";

import { Dropdown } from "../utils";
import { makeReduxID } from "../utils/firehose";
import { k8sCreate } from "../../module/k8s";
import actions from "../../module/k8s/k8s-actions";
import { StorageClassModel } from "../../models";
import { connect } from "react-redux";
import InputField from "../input-field";
import storageClassTypes from "./storage-class-types";
import { StorageClassPageProps, StorageClassPageState } from "../storage-class";

const defaultState = {
  showModal: false,
  activeStepIndex: 0,
  newStorage: {
    name: "",
    type: null,
    parameters: {},
    reclaim: null
  },
  nameValid: null,
  nameTouched: false,
  nextStepDisabled: true,
  loading: false,
  error: null,
  label: "Storage Class Name",
  inputValue: "Enter Storage Class Name"
};


const reclaimPolicies = {
  Retain: "Retain",
  Delete: "Delete"
};

class StorageClassForm extends Component {
  constructor(props) {
    super(props);
    this.state = defaultState;
    this.reduxId = makeReduxID(StorageClassModel, {});
    this.props.watchK8sList(this.reduxId, {}, StorageClassModel);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.resources;
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit(event) {
    alert("A name was submitted: " + this.state.value);
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <InputField {...this.props} label="Name" />
        <input type="submit" value="Submit" />
        <input type="submit" value="Cancel" />
      </form>
    );
  }
}

const mapStateToProps = ({ k8s }, { onClose, show }) => ({
  k8s: k8s,
  onClose: onClose,
  show: show
});

const mapDispatchToProps = () => ({
  stopK8sWatch: actions.stopK8sWatch,
  watchK8sList: actions.watchK8sList
});

export default StorageClassForm;
// export default connect(
//   mapStateToProps,
//   mapDispatchToProps
// )(StorageClassForm);
/* eslint-enable no-undef */
