var models = require('../data/models');

module.exports = (GarageDoor, _, fs) => {

	GarageDoor.data = {

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
				isOpen: isOpen
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

		insertGuestPermission: (code, expiration, inactive) => {
			if (_.isObject(code) && !expiration && !inactive){ // Code is actually an object containing the necessary params
				code = code.code;
				expiration = code.expiration;
				inactive = code.inactive;
			}

			models.GuestPermission.create({
				code: code.toString(),
				inactive: !!inactive,
				expiration: expiration || null
			});
		},

		getGuestPermission: (code) => {
			return models.GuestPermission.findOne({
				where: {
					code: code
				}
			});
		}
	};
}
