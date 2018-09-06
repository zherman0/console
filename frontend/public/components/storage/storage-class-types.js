export const storageClassTypes = {
  aws: {
    title: "AWS",
    provisioner: "kubernetes.io/aws-ebs",
    parameters: {
      type: {
        name: "Type",
        values: { io1: "io1", gp2: "gp2", sc1: "sc1", st1: "st1" },
        placeholder: "Choose AWS Type"
      },
      zone: {
        name: "Zone",
        placeholder: "AWS zone",
        validation: params => {
          if (
            params.zone.value !== "" &&
            _.get(params, "zones.value", "") !== ""
          ) {
            return "zone and zones parameters must not be used at the same time";
          }
          return null;
        }
      },
      zones: {
        name: "Zones",
        placeholder: "AWS zones",
        validation: params => {
          if (
            params.zones.value !== "" &&
            _.get(params, "zone.value", "") !== ""
          ) {
            return "zone and zones parameters must not be used at the same time";
          }
          return null;
        }
      },
      iopsPerGB: {
        name: "IOPS Per GB",
        placeholder: "I/O operations per second per GiB",
        validation: params => {
          if (
            params.iopsPerGB.value !== "" &&
            !params.iopsPerGB.value.match(/^[1-9]\d*$/)
          ) {
            return "iopsPerGB must be a number";
          }
          return null;
        },
        visible: params => _.get(params, "type.value") === "io1"
      },
      encrypted: {
        name: "Encrypted",
        type: "checkbox",
        format: value => value.toString()
      },
      kmsKeyId: {
        placeholder:
          "The full Amazon Resource Name of the key to use when encrypting the volume",
        visible: params => _.get(params, "encrypted.value", false)
      }
    }
  },
  gce: {
    title: "GCE",
    provisioner: "kubernetes.io/gce-pd",
    parameters: {
      type: {
        name: "Type",
        values: { "pd-standard": "pd-standard", "pd-ssd": "pd-ssd" },
        placeholder: "Choose GCE type"
      },
      zone: {
        name: "Zone",
        validation: params => {
          if (
            params.zone.value !== "" &&
            _.get(params, "zones.value", "") !== ""
          ) {
            return "zone and zones parameters must not be used at the same time";
          }
          return null;
        }
      },
      zones: {
        name: "Zones",
        validation: params => {
          if (
            params.zones.value !== "" &&
            _.get(params, "zone.value", "") !== ""
          ) {
            return "zone and zones parameters must not be used at the same time";
          }
          return null;
        }
      },
      "replication-type": {
        name: "Replication Type",
        values: { none: "none", "regional-pd": "regional-pd" },
        placeholder: "Choose Replication Type",
        validation: params => {
          if (
            params["replication-type"].value === "regional-pd" &&
            _.get(params, "zone.value", "") !== ""
          ) {
            return "zone cannot be specified when Replication Type regional-pd is chosen, use zones instead";
          }
          return null;
        }
      }
    }
  },
  glusterfs: {
    title: "Glusterfs",
    provisioner: "kubernetes.io/glusterfs",
    parameters: {
      resturl: {
        name: "Gluster REST/Heketi URL"
      },
      restuser: {
        name: "Gluster REST/Heketi user"
      },
      secretNamespace: {
        name: "Secret Namespace"
      },
      secretName: {
        name: "Secret Name"
      },
      clusterid: {
        name: "Cluster ID"
      },
      gidMin: {
        name: "GID Min",
        validation: params => {
          if (
            params.gidMin.value !== "" &&
            !params.gidMin.value.match(/^[1-9]\d*$/)
          ) {
            return "GID Min must be number";
          }
          return null;
        }
      },
      gidMax: {
        name: "GID Max",
        validation: params => {
          if (
            params.gidMax.value !== "" &&
            !params.gidMax.value.match(/^[1-9]\d*$/)
          ) {
            return "GID Max must be number";
          }
          return null;
        }
      },
      volumetype: {
        name: "Volume Type"
      }
    }
  },
  openstackCinder: {
    title: "OpenStack Cinder",
    provisioner: "kubernetes.io/cinder",
    parameters: {
      type: {
        name: "Volume Type"
      },
      availability: {
        name: "Availability Zone"
      }
    }
  },
  azureFile: {
    title: "Azure File",
    provisioner: "kubernetes.io/azure-file",
    parameters: {
      skuName: {
        name: "SKU Name",
        placeholder: "SKU Name"
      },
      location: {
        name: "Location",
        placeholder: "Location"
      },
      storageAccount: {
        name: "Azure Storage Account Name",
        placeholder: "Azure Storage Account Name"
      }
    }
  },
  azureDisk: {
    title: "Azure Disk",
    provisioner: "kubernetes.io/azure-disk",
    parameters: {
      storageaccounttype: {
        name: "Storage Account Type",
        placeholder: "Storage Account Type"
      },
      kind: {
        name: "Account Kind",
        values: {
          shared: "shared",
          dedicated: "dedicated",
          managed: "managed"
        },
        placeholder: "Choose Account Kind"
      }
    }
  },
  quobyte: {
    title: "Quobyte",
    provisioner: "kubernetes.io/quobyte",
    parameters: {
      quobyteAPIServer: {
        name: "Quobyte API Server",
        placeholder: "Quobyte API Server"
      },
      registry: {
        name: "Registry Address(es)",
        placeholder: "Registry Address(es)"
      },
      adminSecretName: {
        name: "Admin Secret Name",
        placeholder: "Admin Secret Name"
      },
      adminSecretNamespace: {
        name: "Admin Secret Namespace",
        placeholder: "Admin Secret Namespace"
      },
      user: {
        name: "User",
        placeholder: "User"
      },
      group: {
        name: "Group",
        placeholder: "Group"
      },
      quobyteConfig: {
        name: "Quobyte Configuration",
        placeholder: "Quobyte Configuration"
      },
      quobyteTenant: {
        name: "Quobyte Tenant",
        placeholder: "Quobyte Tenant"
      }
    }
  },
  cephRbd: {
    title: "Ceph RBD",
    provisioner: "kubernetes.io/rbd",
    parameters: {
      monitors: {
        name: "Monitors",
        placeholder: "Monitors"
      },
      adminId: {
        name: "Admin Client ID",
        placeholder: "Admin Client ID"
      },
      adminSecretName: {
        name: "Admin Secret Name",
        placeholder: "Admin Secret Name"
      },
      adminSecretNamespace: {
        name: "Admin Secret Namespace",
        placeholder: "Admin Secret Namespace"
      },
      pool: {
        name: "Pool",
        placeholder: "Pool"
      },
      userId: {
        name: "User Client ID",
        placeholder: "User Client ID"
      },
      userSecretName: {
        name: "User Secret Name",
        placeholder: "User Secret Name"
      },
      fsType: {
        name: "Filesystem Type",
        placeholder: "Filesystem Type"
      },
      imageFormat: {
        name: "Image Format",
        values: { 1: "1", 2: "2" },
        placeholder: "Choose Image Format"
      },
      imageFeatures: {
        name: "Image Features",
        placeholder: "Image Features",
        visible: params => _.get(params, "imageFormat.value") === "2"
      }
    }
  },
  vSphereVolume: {
    title: "vSphere Volume",
    provisioner: "kubernetes.io/vsphere-volume",
    parameters: {
      diskformat: {
        name: "Disk Format",
        values: {
          thin: "thin",
          zeroedthick: "zeroedthick",
          eagerzeroedthick: "eagerzeroedthick"
        },
        placeholder: "Choose Disk Format"
      },
      datastore: {
        name: "Datastore",
        placeholder: "Datastore"
      }
    }
  },
  portworxVolume: {
    title: "Portworx Volume",
    provisioner: "kubernetes.io/portworx-volume",
    parameters: {
      repl: {
        name:
          "Number of synchronous replicas to be provided in the form of replication factor",
        placeholder: "Number of Replicas",
        validation: params => {
          if (
            params.repl.value !== "" &&
            !params.repl.value.match(/^[1-9]\d*$/)
          ) {
            return "Number of replicas must be a number";
          }
          return null;
        }
      },
      snap_interval: {
        // eslint-disable-line camelcase
        name: "Snapshot Interval",
        placeholder:
          "Clock/time interval in minutes for when to trigger snapshots",
        validation: params => {
          if (
            params.repl.value !== "" &&
            !params.repl.value.match(/^[1-9]\d*$/)
          ) {
            return "Snapshot interval must be a number";
          }
          return null;
        },
        format: value => value.toString()
      },
      io_priority: {
        // eslint-disable-line camelcase
        name: "I/O Priority",
        values: { high: "high", medium: "medium", low: "low" },
        placeholder: "I/O Priority"
      },
      fs: {
        name: "Filesystem",
        values: { none: "none", xfs: "xfs", ext4: "ext4" },
        placeholder: "Filesystem to be laid out"
      },
      block_size: {
        // eslint-disable-line camelcase
        name: "Block Size",
        placeholder: "Block size in Kb",
        validation: params => {
          if (
            params.block_size.value !== "" &&
            !params.block_size.value.match(/^[1-9]\d*$/)
          ) {
            return "Snapshot interval must be a number";
          }
          return null;
        }
      },
      aggregation_level: {
        // eslint-disable-line camelcase
        name: "Aggregation Level",
        placeholder:
          "The number of chunks the volume would be distributed into",
        validation: params => {
          if (
            params.aggregation_level.value !== "" &&
            !params.aggregation_level.value.match(/^[1-9]\d*$/)
          ) {
            return "Aggregation level must be a number";
          }
          return null;
        },
        format: value => value.toString()
      },
      ephemeral: {
        name: "Ephemeral",
        type: "checkbox",
        format: value => value.toString()
      }
    }
  },
  scaleIo: {
    title: "ScaleIO",
    provisioner: "kubernetes.io/scaleio",
    parameters: {
      gateway: {
        name: "API Gateway",
        placeholder: "Address to a ScaleIO API gateway"
      },
      system: {
        name: "System Name",
        placeholder: "Name of the ScaleIO system"
      },
      protectionDomain: {
        name: "Protection Domain",
        placeholder: "Name of the ScaleIO protection domain"
      },
      storagePool: {
        name: "Storage Pool",
        placeholder: "Name of the volume storage pool"
      },
      storageMode: {
        name: "Storage Mode",
        values: {
          thinProvisioned: "ThinProvisioned",
          thickProvisioned: "ThickProvisioned"
        },
        placeholder: "Storage provision mode"
      },
      secretRef: {
        name: "Secret Reference",
        placeholder: "Reference to a configured Secret object"
      },
      readOnly: {
        name: "Read Only",
        type: "checkbox"
      },
      fsType: {
        name: "Filesystem Type",
        placeholder: "Filesystem to use for the volume"
      }
    }
  },
  storageOs: {
    title: "StorageOS",
    provisioner: "kubernetes.io/storageos",
    parameters: {
      pool: {
        name: "Pool",
        placeholder:
          "Name of the StorageOS distributed capacity pool from which to provision the volume"
      },
      description: {
        name: "Description",
        placeholder:
          "Description to assign to volumes that were created dynamically"
      },
      fsType: {
        name: "Filesystem Type",
        placeholder: "Default filesystem type to request"
      },
      adminSecretName: {
        name: "Admin Secret Name",
        placeholder:
          "Name of the secret to use for obtaining the StorageOS API credentials"
      },
      adminSecretNamespace: {
        name: "Admin Secret Namespace",
        placeholder: "Namespace where the API configuration secret is located"
      }
    }
  }
};
