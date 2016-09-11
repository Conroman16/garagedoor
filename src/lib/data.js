var _ = require('underscore'),
	fs = require('fs'),
	sqlite = require('sqlite3').verbose();

module.exports = (GarageDoor) => {

	GarageDoor.data = {
		queries: {
			create: { // These should be 'IF NOT EXISTS' statements because they are executed on every application start
				eventLog: 'CREATE TABLE IF NOT EXISTS EventLog (ID INTEGER PRIMARY KEY, timestamp DATE, event TEXT, event_data TEXT)',
				doorLog: 'CREATE TABLE IF NOT EXISTS DoorLog (ID INTEGER PRIMARY KEY, timestamp DATE, is_open BLOB)',
				errorLog: 'CREATE TABLE IF NOT EXISTS ErrorLog (ID INTEGER PRIMARY KEY, timestamp DATE, error_message TEXT, stack_trace TEXT)'
			},
			insert: {
				eventLog: 'INSERT INTO EventLog (timestamp, event, event_data) VALUES (?, ?, ?)',
				doorLog: 'INSERT INTO DoorLog (timestamp, is_open) VALUES (?, ?)',
				errorLog: 'INSERT INTO ErrorLog (timestamp, error_message, stack_trace) VALUES (?, ?, ?)'
			}
		},

		initialize: () => {
			var dbExists = fs.existsSync(GarageDoor.DB_FILE);
			if(!dbExists){
				console.log('Creating database...');
				fs.openSync(GarageDoor.DB_FILE, 'w');
			}

			GarageDoor.data.db = new sqlite.Database(GarageDoor.DB_FILE);
			GarageDoor.data.createTables();
		},

		dispose: () => {
			if (GarageDoor.data.db)
				GarageDoor.data.db.close();
		},

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
			else if (!e.data)
				e.data = {};

			GarageDoor.data.db.serialize(() => {
				var stmt = GarageDoor.data.db.prepare(GarageDoor.data.queries.insert.eventLog);
				stmt.run(new Date(), e.event, JSON.stringify(e.data));
				stmt.finalize();
			});
		},

		logDoorStateChange: (isOpen) => {
			if (isOpen === undefined)
				return;

			GarageDoor.data.db.serialize(() => {
				var stmt = GarageDoor.data.db.prepare(GarageDoor.data.queries.insert.doorLog);
				stmt.run(new Date(), isOpen);
				stmt.finalize();
			});
		},

		logDoorOpen: () => {
			GarageDoor.data.logDoorStateChange(true);
		},

		logDoorClose: () => {
			GarageDoor.data.logDoorStateChange(false);
		},

		logError: (err) => {
			if (!err)
				return;

			GarageDoor.data.db.serialize(() => {
				var stmt = GarageDoor.data.db.prepare(GarageDoor.data.queries.insert.errorLog);
				stmt.run(new Date(), err.message, err.stack);
				stmt.finalize();
			});
		}
	};
}
