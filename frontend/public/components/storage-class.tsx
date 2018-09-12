import * as React from 'react';
import * as _ from 'lodash-es';

import { ColHead, DetailsPage, List, ListHeader, ListPage } from './factory';
import { Cog, detailsPage, navFactory, ResourceCog, SectionHeading, ResourceLink, ResourceSummary } from './utils';
// eslint-disable-next-line no-unused-vars
import { K8sResourceKind, K8sResourceKindReference } from '../module/k8s';
// import InputField from './input-field'
// import StorageClassForm from './storage/storage-class-form';

export const StorageClassReference: K8sResourceKindReference = 'StorageClass';

const menuActions = [Cog.factory.ModifyLabels, Cog.factory.ModifyAnnotations, Cog.factory.Edit, Cog.factory.Delete];

const defaultClassAnnotation = 'storageclass.beta.kubernetes.io/is-default-class';
const isDefaultClass = (storageClass: K8sResourceKind) => _.get(storageClass, ['metadata', 'annotations', defaultClassAnnotation], 'false');

const StorageClassHeader = props => <ListHeader>
  <ColHead {...props} className="col-sm-4 col-xs-6" sortField="metadata.name">Name</ColHead>
  <ColHead {...props} className="col-sm-4 col-xs-6" sortField="provisioner">Provisioner</ColHead>
  <ColHead {...props} className="col-sm-2 hidden-xs" sortField="reclaimPolicy">Reclaim Policy</ColHead>
  <ColHead {...props} className="col-sm-2 hidden-xs" sortField={`metadata.annotations['${defaultClassAnnotation}']`}>Default Class</ColHead>
</ListHeader>;

const StorageClassRow: React.SFC<StorageClassRowProps> = ({obj}) => {
  return <div className="row co-resource-list__item">
    <div className="col-sm-4 col-xs-6 co-break-word co-resource-link-wrapper">
      <ResourceCog actions={menuActions} kind={StorageClassReference} resource={obj} />
      <ResourceLink kind={StorageClassReference} name={obj.metadata.name} namespace={undefined} title={obj.metadata.name} />
    </div>
    <div className="col-sm-4 col-xs-6 co-break-word">
      {obj.provisioner}
    </div>
    <div className="col-sm-2 hidden-xs">
      {obj.reclaimPolicy || '-'}
    </div>
    <div className="col-sm-2 hidden-xs">
      {isDefaultClass(obj)}
    </div>
  </div>;
};

const StorageClassDetails: React.SFC<StorageClassDetailsProps> = ({obj}) => <React.Fragment>
  <div className="co-m-pane__body">
    <SectionHeading text="StorageClass Overview" />
    <ResourceSummary resource={obj} showNodeSelector={false} showPodSelector={false}>
      <dt>Provisioner</dt>
      <dd>{obj.provisioner || '-'}</dd>
      <dt>Reclaim Policy</dt>
      <dd>{obj.reclaimPolicy || '-'}</dd>
      <dt>Default Class</dt>
      <dd>{isDefaultClass(obj)}</dd>
    </ResourceSummary>
  </div>
</React.Fragment>;

export const StorageClassList: React.SFC = props => <List {...props} Header={StorageClassHeader} Row={StorageClassRow} />;
StorageClassList.displayName = 'StorageClassList';

/* eslint-disable no-undef */
export class StorageClassPage extends React.Component<StorageClassPageProps, StorageClassPageState> {

  constructor(props){
    super(props);
    this.state = {
      showForm: false
    };
  }

  createItems = {
    wizard: 'Create with Form',
    yaml: 'Create from YAML'
  };

  createProps = {
    items: this.createItems,
    btnActionItemKey: 'form',
    action: (type) => {
      switch (type) {
        case 'form':
        // return () => this.setState({showForm: true});
          return null;
        default:
          return `/k8s/cluster/storageclasses/new/`;
      }
    }
  };

  render() {
    return (
      <React.Fragment>

        <ListPage {...this.props}
          title="Storage Classes"
          kind={StorageClassReference}
          ListComponent={StorageClassList}
          canCreate={true}
          filterLabel={this.props.filterLabel}
          createProps={this.createProps} />;
      </React.Fragment>
    );
  }
}

const pages = [navFactory.details(detailsPage(StorageClassDetails)), navFactory.editYaml()];

export const StorageClassDetailsPage: React.SFC<StorageClassDetailsPageProps> = props => {
  return <DetailsPage {...props} kind={StorageClassReference} menuActions={menuActions} pages={pages} />;
};
StorageClassDetailsPage.displayName = 'StorageClassDetailsPage';

/* eslint-disable no-undef */
export type StorageClassRowProps = {
  obj: any,
};

export type StorageClassDetailsProps = {
  obj: any,
};

export type StorageClassPageProps = {
  filterLabel: string,
  namespace: string
};

export type StorageClassPageState = {
  showForm: boolean
};

export type StorageClassDetailsPageProps = {
  match: any,
};
/* eslint-enable no-undef */
