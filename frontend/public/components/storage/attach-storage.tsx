/* eslint-disable no-undef, no-unused-vars */
import * as _ from 'lodash-es';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import {
  k8sGet,
  K8sResourceKind,
  k8sUpdate,
  referenceFor,
} from '../../module/k8s';
import * as k8sModels from '../../models';
import {
  ButtonBar,
  history,
  ResourceDropdown,
  ResourceLink,
  resourceObjPath,
} from '../utils';
import { Checkbox } from '../checkbox';
import { formatNamespacedRouteForResource } from '../../ui/ui-actions';

const PvcDropdown: React.SFC<PvcDropdownProps> = props => {
  const kind = 'PersistentVolumeClaim';
  const { namespace, selectedKey, required, name } = props;
  const resources = [{ kind, namespace }];
  return (
    <ResourceDropdown
      {...props}
      desc="Storage"
      resources={resources}
      selectedKeyKind={kind}
      placeholder="Select persistent volume claim"
      selectedKey={selectedKey}
      required={required}
      namespace={namespace}
      name={name}
    />
  );
};
export type PvcDropdownProps = {
  namespace: string;
  selectedKey: string;
  required: boolean;
  onChange: any;
  id: string;
  name: string;
};

// Helper functions for storage operations
const createVolume = (name: string, claimName: string) => ({
  name,
  persistentVolumeClaim: {
    claimName,
  },
});

const createVolumeMount = (
  name: string,
  mountPath: string,
  subPath: string,
  mountAsReadOnly: boolean
) => {
  const mount: any = {
    name,
    mountPath,
    mountAsReadOnly,
  };

  if (subPath) {
    mount.subPath = subPath;
  }

  return mount;
};

// Gets the mount paths currently defined in the pod template.
const getMountPaths = (podTemplate: any, matchContainer: any) => {
  const containers = _.get(podTemplate, 'spec.containers', []);
  return containers.reduce((acc, container) => {
    if (!matchContainer(container)) {
      return acc;
    }
    const mountPaths = _.map(container.volumeMounts, 'mountPath');
    return acc.concat(mountPaths);
  }, '');
};

//Return kind type give the plural
const getKindFromPlural = (plural: string) => {
  const ko = _.find(k8sModels, model => model.plural === plural);
  return ko.kind;
};
class AttachStorageForm extends React.Component<
  AttachStorageProps,
  AttachStorageState
  > {
  constructor(props) {
    super(props);
    const existingResource = _.pick(props.obj, ['metadata', 'spec']);
    const resourceObj = _.defaultsDeep({}, props.fixed, existingResource, {
      apiVersion: 'v1',
      data: {},
      kind: props.kind,
      metadata: {
        name: '',
      },
      spec: {},
    });

    this.state = {
      resourceObj,
      inProgress: false,
      formData: {
        claimName: '',
        volumeName: '',
        mountPath: '',
        subPath: '',
      },
      mountAsReadOnly: false,
      disableForm: false,
      checkboxItem: {
        value: 'Mount as read-only',
      },
      selectedOptions: [],
      storage: {
        allContainers: true,
        containers: {},
        existingMountPaths: '',
        volumeAlreadyMounted: false,
      },
    };
  }

  componentDidMount() {
    const { kind, metadata } = this.state.resourceObj;
    const ko = _.find(k8sModels, model => model.plural === kind);
    const supportedKinds = [
      'Deployment',
      'DeploymentConfig',
      'ReplicaSet',
      'ReplicationController',
    ];

    if (!_.includes(supportedKinds, ko.kind)) {
      this.setState({
        error: `Storage is not supported for kind ${ko.kind}.`,
      });
      return;
    }

    // Get the current resource so we can add to its definition
    k8sGet(ko, metadata.name, metadata.namespace).then(
      resourceObj => {
        this.setState({ resourceObj });
      },
      err => this.setState({ error: err.message })
    );
  }

  private updateVolumeName = (claimName: string) => {
    const { resourceObj, formData, storage } = this.state;
    // Check if there is already a volume for this PVC.
    let volumes = _.get(resourceObj, 'spec.template.spec.volumes');
    let volume: any = _.find(volumes, {
      persistentVolumeClaim: {
        claimName: claimName,
      },
    });
    if (volume) {
      // If there's already a  volume, reuse the volume name.
      storage.volumeAlreadyMounted = true;
      formData.volumeName = volume.name;
    } else if (storage.volumeAlreadyMounted) {
      // Clear the volume name value since it was associated with the previously selected PVC.
      formData.volumeName = '';
      storage.volumeAlreadyMounted = false;
    }
    this.setState({ formData, storage });
  };
  onError = error => {
    this.setState({
      error,
      inProgress: false,
    });
  };

  handleChange: React.ReactEventHandler<HTMLInputElement> = event => {
    const { name, value } = event.currentTarget;
    const formData = { ...this.state.formData, [name]: value };
    this.setState({ formData });
  };

  // Add logic to check this handler for if a mount path is not unique
  handleMountPathChange: React.ReactEventHandler<HTMLInputElement> = event => {
    const { name, value } = event.currentTarget;
    const formData = { ...this.state.formData, [name]: value };
    this.setState({ formData });
    //   Look at the existing mount paths so that we can warn if the new value is not unique.
    this.checkMountPaths(value);
  };

  handlePvcChange = event => {
    const { name, value } = event.target;
    this.updateVolumeName(value);
    const formData = { ...this.state.formData, [name]: value };
    this.setState({ formData });
  };

  onMountAsReadOnlyChanged = event => {
    const mountAsReadOnly = !this.state.mountAsReadOnly;
    this.setState({ mountAsReadOnly });
    // Now deal with selecting checkbox
    let value = event.currentTarget.value;
    let checked = new Set(this.state.selectedOptions);
    if (checked.has(value)) {
      checked.delete(value);
    } else {
      checked.add(value);
    }
    this.setState({ selectedOptions: Array.from(checked) });
  };

  onFormDisable = disable => {
    this.setState({
      disableForm: disable,
    });
  };

  validateForm = () => {
    // Check that a valid PVC has been choosen
    if (!this.state.formData.claimName) {
      this.setState({ error: 'Storage must be selected' });
      return false;
    }
    return true;
  };

  // Add Attach storage //
  save = (event: React.FormEvent<EventTarget>) => {
    event.preventDefault();
    if (!this.validateForm()) {
      return;
    }
    const { kind, metadata } = this.state.resourceObj;
    const ko = _.find(k8sModels, model => model.kind === kind);
    const resourceObj = { ...this.state.resourceObj };
    const template = resourceObj.spec.template;
    const { mountPath, subPath, claimName } = this.state.formData;
    let { volumeName } = this.state.formData;
    const mountAsReadOnly = this.state.mountAsReadOnly;
    const { storage } = this.state;
    const isContainerSelected = ({ name }) =>
      storage.allContainers || storage.containers[name];
    //   Look at the existing mount paths so that we can warn if the new value is not unique.
    storage.existingMountPaths = getMountPaths(
      resourceObj.spec.template,
      isContainerSelected
    );

    // generate a volume name if not provided
    if (!volumeName) {
      volumeName = `volume-${claimName}`;
    }
    if (mountPath) {
      // for each container in the pod spec, add the new volume mount

      _.each(template.spec.containers, container => {
        if (!isContainerSelected(container)) {
          return;
        }
        const newVolumeMount = createVolumeMount(
          volumeName,
          mountPath,
          subPath,
          mountAsReadOnly
        );
        if (!container.volumeMounts) {
          container.volumeMounts = [];
        }
        container.volumeMounts.push(newVolumeMount);
      });
    }

    // add the new volume to the pod template
    if (!storage.volumeAlreadyMounted) {
      template.spec.volumes = template.spec.volumes || [];
      template.spec.volumes.push(createVolume(volumeName, claimName));
    }

    this.setState({ inProgress: true });
    k8sUpdate(ko, resourceObj, metadata.namespace, metadata.name).then(
      resource => {
        this.setState({ inProgress: false });
        history.push(resourceObjPath(resource, referenceFor(resource)));
      },
      err => this.setState({ error: err.message, inProgress: false })
    );
  };

  private checkMountPaths = (path: string) => {
    const storage = { ...this.state.storage };
    const isContainerSelected = ({ name }) =>
      storage.allContainers || storage.containers[name];
    const existingMountPaths: string = getMountPaths(
      this.state.resourceObj.spec.template,
      isContainerSelected
    );
    let helpMsg = '';
    let mtPaths = existingMountPaths.split(',');
    if (mtPaths.indexOf(path) > -1) {
      helpMsg = 'Mount Path is already in use';
    }
    this.setState({ error: helpMsg });
  };

  render() {
    const title = 'Add Storage';
    return (
      <div className="co-m-pane__body">
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <form
          className="co-m-pane__body-group co-create-secret-form"
          onSubmit={this.save}
        >
          <h1 className="co-m-pane__heading">{title}</h1>
          <div className="co-m-pane__explanation co-resource-link-wrapper ">
            {this.props.explanation}
            &nbsp;
            <ResourceLink
              kind={getKindFromPlural(this.props.kind)}
              name={this.props.name}
              namespace={this.props.namespace}
            />
          </div>
          <fieldset disabled={!this.props.isCreate}>
            <div className="form-group">
              <label
                className="control-label co-required"
                htmlFor="volume-name"
              >
                Storage
              </label>
              <PvcDropdown
                namespace={this.props.namespace}
                onChange={this.handlePvcChange}
                id="claimName"
                name="claimName"
                selectedKey={this.state.formData.claimName}
                required
              />
            </div>
            <div className="form-group">
              <label className="control-label" htmlFor="volume-name">
                Volume Name
              </label>
              <div>
                <input
                  className="form-control"
                  type="text"
                  onChange={this.handleChange}
                  aria-describedby="volume-name-help"
                  id="volume-name"
                  name="volumeName"
                  value={this.state.formData.volumeName}
                  pattern="[a-z0-9](?:[-a-z0-9]*[a-z0-9])?"
                />
                <p className="form-text text-muted" id="volume-name-help">
                  Unique name to identfiy this volume. If not specified, a
                  volume name is generated.
                </p>
              </div>
            </div>
            <div className="form-group">
              <label className="control-label" htmlFor="mount-path">
                Mount Path
              </label>
              <div>
                <input
                  className="form-control"
                  type="text"
                  onChange={this.handleMountPathChange}
                  aria-describedby="mount-path-help"
                  name="mountPath"
                  id="mount-path"
                  value={this.state.formData.mountPath}
                />
                <p className="form-text text-muted" id="mount-path-help">
                  Mount path for the volume inside the container. If not
                  specified, the volume will not be mounted automatically.
                </p>
                <Checkbox
                  title=""
                  item={this.state.checkboxItem}
                  onChange={this.onMountAsReadOnlyChanged}
                  checked={this.state.mountAsReadOnly}
                  selectedOptions={this.state.selectedOptions}
                  name="mountAsReadOnly"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="control-label" htmlFor="subpath">
                Subpath
              </label>
              <div>
                <input
                  className="form-control"
                  type="text"
                  onChange={this.handleChange}
                  aria-describedby="subpath-help"
                  id="subpath"
                  name="subPath"
                  value={this.state.formData.subPath}
                />
                <p className="form-text text-muted" id="subpath-help">
                  Optional path within the volume from which it will be mounted
                  into the container. Defaults to the root of volume.
                </p>
              </div>
            </div>
          </fieldset>
          <ButtonBar
            errorMessage={this.state.error}
            inProgress={this.state.inProgress}
          >
            <button
              type="submit"
              disabled={this.state.disableForm}
              className="btn btn-primary"
              id="save-changes"
            >
              {this.props.saveButtonText || 'Create'}
            </button>
            <Link
              to={formatNamespacedRouteForResource(
                `${this.props.kind}/${this.props.name}`
              )}
              className="btn btn-default"
              id="cancel"
            >
              Cancel
            </Link>
          </ButtonBar>
        </form>
      </div>
    );
  }
}

export const AttachStorage = ({ match: { params } }) => {
  return (
    <AttachStorageForm
      fixed={{ metadata: { namespace: params.ns, name: params.name } }}
      explanation={'Add a new or existing persistent volume claim to   '}
      titleVerb="Add"
      saveButtonText="Add Storage"
      isCreate={true}
      namespace={params.ns}
      name={params.name}
      kind={params.plural}
    />
  );
};

export type AttachStorageState = {
  resourceObj: K8sResourceKind;
  inProgress: boolean;
  formData: {
    claimName: string;
    volumeName: string;
    mountPath: string;
    subPath: string;
  };
  mountAsReadOnly: boolean;
  error?: any;
  disableForm: boolean;
  checkboxItem: any;
  selectedOptions: any;
  storage: {
    allContainers: boolean;
    containers: any;
    existingMountPaths: string;
    volumeAlreadyMounted: boolean;
  };
};

export type AttachStorageProps = {
  obj?: K8sResourceKind;
  fixed: any;
  kind?: string;
  isCreate: boolean;
  titleVerb: string;
  saveButtonText?: string;
  explanation: string;
  namespace: string;
  name: string;
};

/* eslint-enable no-undef */
