'use strict';

const config = {
    general: {
	name: 'EvoEx'
    },
    database: {
	dbName: 'evoex'
    }
};

// TODO: change back snackend import path after finishing debugging
const Snackend = require('snackend')({level: 'verbose'});
const FileHandlingSchema = require('snackend').FileHandlingSchema;
const File = require('snackend').File;
const ProtectedEndpoint = require('snackend').ProtectedEndpoint;
const log = require('snackend').logger.log;

const app = new Snackend(config);

app.addController('card'
	, new FileHandlingSchema({
		image: File
	}), '/deck')
	.useEndpointTemplate('create')
	.useEndpointTemplate('findByQuery')
	.useEndpointTemplate('downloadOneFileBy', 'id');

app.addController('game'
	, new FileHandlingSchema({
		name: String,
		players: [{username: String, deck: ['ObjectId'], turn: Boolean}],
		order: [Number],
		turn: Number,
		mode: String}), '/game')
	.useEndpointTemplate('create')
	.addEndpoint(new ProtectedEndpoint('/get/players', 'GET', async (ctx, next, Model, log) => {
		log.debug(`Getting players of game '${ctx.query.name}'`);
		const game = await Model.findOne({name: ctx.query.name}, 'players.username players.turn -_id').exec();
		ctx.body = game.players;
		ctx.status = 200;
	}))
	.addEndpoint(new ProtectedEndpoint('/get/taken/cards', 'GET', async (ctx, next, Model, log) => {
		log.debug(`Getting taken cards of game '${ctx.query.name}'`);
		const game = await Model.findOne({ name: ctx.query.name });
		ctx.body = game.players.reduce((deck, player) => [...deck, ...player.deck], []);
		ctx.status = 200;
	}))
	.addEndpoint(new ProtectedEndpoint('/get/my/deck', 'GET', async (ctx, next, Model, log) => {
		log.debug(`User '${ctx.user.name}' requests his deck in game '${ctx.query.name}'`);
		const game = await Model.findOne({ name: ctx.query.name });
		game.players.forEach(player => {
			if (player.username === ctx.user.name) ctx.body = player.deck; // get user from JWT
		});
		ctx.status = 200;
	})).addEndpoint(new ProtectedEndpoint('/join', 'GET', async (ctx, next, Model, log) => {
		// TODO: update order of players
		log.debug(`User '${ctx.user.name}' is joining the game '${ctx.query.name}'`);
		const game = await Model.findOne({ name: ctx.query.name });
		if (game) {
			game.players.forEach(player => {
				if (player.username === ctx.user.name) {
					log.debug(`User '${ctx.user.name}' is already a member.`);
					ctx.status = 200; // doing nothing, user is already in game
				}
			});
			if (ctx.status !== 200) {
				await Model.updateOne({name: ctx.query.name},
					{$push: {players: {username: ctx.user.name, deck: [], turn: false}}});
				ctx.status = 200;
			}
		} else {
			ctx.status = 404; // game not found
		}
	})).addEndpoint(new ProtectedEndpoint('/take/card', 'GET', async (ctx, next, Model, log) => {
		const game = await Model.findOne({ name: ctx.query.name });
		if (game) {
			game.players.forEach(player => {
				if (player.username === ctx.user.name) {
					log.debug(`Player ${ctx.user.name} takes card ${ctx.query.card}.`);
					player.deck.push(ctx.query.card);
				}
			});
			await game.save();
			ctx.status = 200;
		} else {
			ctx.status = 404; // game not found
		}
	})).addEndpoint(new ProtectedEndpoint('/update/turn', 'GET', async (ctx, next, Model, log) => {
		log.debug(`User '${ctx.user.name}' is updating players turn.`);
		const game = await Model.findOne({ name: ctx.query.name });
		if (game) {
			game.players[game.order[game.turn]].turn = false;
			game.turn += 1;
			if (game.turn >= game.order.length){
				game.turn = 0;
			}
			game.players[game.order[game.turn]].turn = true;
			await game.save();
			ctx.status = 200;
		} else {
			ctx.status = 404; // game not found
		}
	})).addEndpoint(new ProtectedEndpoint('/my/turn', 'GET', async (ctx, next, Model, log) => {
		log.debug(`User '${ctx.user.name}' requests if it's his turn.`);
		const game = await Model.findOne({ name: ctx.query.name });
		if (game) {
			let playersTurn = false;
			game.players.forEach(player => {
				if (player.username === ctx.user.name){
					playersTurn = player.turn;
				}
			});
			ctx.body = playersTurn;
			ctx.status = 200;
		} else {
			ctx.status = 404; // game not found
		}
	}));

app.useController('user');
	//.useEndpointTemplate('downloadOneFileBy', 'id');

app.serve()
    .then(() => log.info('We\'re glad to serving you the EvoEx backend powered by snackend.'))
    .catch(() => log.error('An Error occured trying to serve EvoEx\'s backend.'));
