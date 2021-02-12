'use strict';

const config = {
    general: {
	name: 'picSe'
    },
    database: {
	dbName: 'picse'
    }
};

const Schema = require('mongoose').Schema;

/*const Snackend = require('snackend')({level: 'silly'});
const FileHandlingSchema = require('snackend').FileHandlingSchema;
const File = require('snackend').File;
const ProtectedEndpoint = require('snackend').ProtectedEndpoint;
const Endpoint = require('snackend').Endpoint;
const log = require('snackend').logger.log;*/

// DEBUG IMPORTS
const Snackend = require('../../../snackend')({level: 'silly'});
const FileHandlingSchema = require('../../../snackend').FileHandlingSchema;
const File = require('../../../snackend').File;
const ProtectedEndpoint = require('../../../snackend').ProtectedEndpoint;
const Endpoint = require('../../../snackend').Endpoint;
const log = require('../../../snackend').logger.log;

const app = new Snackend(config);

app.addController('pic'
		  , new FileHandlingSchema({
		      file: File,
		      date: Date
		  }), '/pics')
    .useProtectedEndpointTemplate('create')
    .useProtectedEndpointTemplate('downloadOneFileBy', 'id')
    .addEndpoint(new ProtectedEndpoint('/get/latest', 'GET', async (ctx, next, Model, log) => {
	ctx.body = await Model.findOne().sort({'date': -1}).exec();
	ctx.status = 200;
    }));

app.useController('user');

app.serve()
    .then(() => log.info('We\'re glad to serving you the PicSe backend powered by snackend.'))
    .catch(() => log.error('An Error occured trying to serve PicSe\'s backend.'));
