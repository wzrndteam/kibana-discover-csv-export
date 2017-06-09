"use strict";
    
require('./navbar/download-button');

const navbarExtensions = require('ui/registry/navbar_extensions');

function discoverControlProvider() {
  return {
    appName: 'discover',
    name: 'kibana-discover-csv-export',
    icon: 'fa-download',
    template: '<kibana-discover-csv-export-button config-template="configTemplate"></kibana-discover-csv-export-button>',
    description: 'csv export',
  };
}

navbarExtensions.register(discoverControlProvider);