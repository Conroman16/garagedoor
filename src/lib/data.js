var models = require('../../models');

module.exports = (GarageDoor, _, fs) => {

	GarageDoor.data = {

		createTables: () => {
			GarageDoor.data.db.serialize(() => {
				_.each(GarageDoor.data.queries.create, (query) => {
					GarageDoor.data.db.run(query);
				});
			});
		},

		// Uses e.event, e.data
		logNewEvent: (e) => {
			if (!e || !e.event)
				return;

			if (!e.data)
				e.data = null;
			else
				e.data = JSON.stringify(e.data);

			models.Event.create(e);
		},

		logSessionAuth: (token, fingerprint) => {
			GarageDoor.data.logNewEvent({
				event: 'SessionAuth',
				data: {
					session: {
						fingerprint: fingerprint,
						token: token
					}
				}
			});
		},

		logSessionRefresh: (token, fingerprint) => {
			GarageDoor.data.logNewEvent({
				event: 'SessionRefresh',
				data: {
					session: {
						fingerprint: fingerprint,
						token: token
					}
				}
			});
		},

		logSocketConnection: (socket) => {
			GarageDoor.data.logNewEvent({
				event: 'SocketConnect',
				data: {
					socketIP: socket.handshake.address
				}
			});
		},

		logDoorStateToggle: (token, fingerprint) => {
			GarageDoor.data.logNewEvent({
				event: 'ToggleDoorState',
				data: {
					session: {
						fingerprint: fingerprint,
						token: token
					}
				}
			});
		},

		logDoorStateChange: (isOpen) => {
			if (isOpen === undefined)
				return;

			models.DoorEvent.create({
				is_open: isOpen
			});
		},

		logDoorOpen: () => {
			GarageDoor.data.logDoorStateChange(true);
		},

		logDoorClose: (session) => {
			GarageDoor.data.logDoorStateChange(false);
		},

		logError: (err) => {
			if (!err)
				err = {};

			models.Error.create({
				message: err.message || '',
				stack: err.stack || null
			});
		},

		// getAllEvents: () => {
		// 	return new Promise((resolve, reject) => {
		// 		GarageDoor.data.db.all(GarageDoor.data.queries.select.allEvents, (err, rows) => {
		// 			if (err)
		// 				reject(err);
		// 			else
		// 				resolve(rows);
		// 		});
		// 	});
		// },

		// getAllSocketEvents: () => {
		// 	return new Promise((resolve, reject) => {
		// 		GarageDoor.data.db.all(GarageDoor.data.queries.select.allSocketEvents, (err, rows) => {
		// 			if (err)
		// 				reject(err);
		// 			else
		// 				resolve(rows);
		// 		});
		// 	});
		// },

		// getAllToggleDoorStates: () => {
		// 	return new Promise((resolve, reject) => {
		// 		GarageDoor.data.db.all(GarageDoor.data.queries.select.allToggleDoorStateEvents, (err, rows) => {
		// 			if (err)
		// 				reject(err);
		// 			else
		// 				resolve(rows);
		// 		});
		// 	});
		// },

		// getAllSessionEvents: () => {
		// 	return new Promise((resolve, reject) => {
		// 		GarageDoor.data.db.all(GarageDoor.data.queries.select.allSessionEvents, (err, rows) => {
		// 			if (err)
		// 				reject(err);
		// 			else
		// 				resolve(rows);
		// 		});
		// 	});
		// },

		getGuestPermission: (code) => {
			return models.GuestPermission.findOne({
				where: {
					code: code
				}
			});
			// return new Promise((resolve, reject) => {
			// 	var query = GarageDoor.data.queries.select.guestCode.replace('{{code}}', code);
			// 	GarageDoor.data.db.get(query, (err, row) => {
			// 		if (err)
			// 			reject(err);
			// 		else
			// 			resolve(row);
			// 	});
			// });
		}
	};
}
