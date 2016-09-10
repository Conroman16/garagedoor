var fs = require('fs'),
	sqlite = require('sqlite3').verbose();

module.exports = (GarageDoor) => {

	GarageDoor.data = {
		queries: {
			create: {
				eventLog: 'CREATE TABLE IF NOT EXISTS EventLog (fingerprint TEXT, event TEXT, timestamp TEXT, event_data TEXT)',
			},
			insert: {
				eventLog: 'INSERT OR REPLACE INTO EventLog (fingerprint, event, timestamp, event_data) VALUES (?, ?, ?, ?)'
			}
		},

		initialize: () => {
			var dbExists = fs.existsSync(GarageDoor.DB_FILE);
			if(!dbExists)
				fs.openSync(GarageDoor.DB_FILE, 'w');

			GarageDoor.data.db = new sqlite.Database(GarageDoor.DB_FILE);

			if (!dbExists){
				'Creating Database...';
				GarageDoor.data.createTables();
			}
		},

		dispose: () => {
			if (GarageDoor.data.db){
				GarageDoor.data.db.close();
				'Database closed';
			}
		},

		createTables: () => {
			GarageDoor.data.db.serialize(() => {
				GarageDoor.data.db.run(GarageDoor.data.queries.create.eventLog);
			});

			GarageDoor.data.logNewEvent({
				event: 'test',
				fingerprint: 'test-fingerprint-placeholder',
				timestamp: new Date().toString(),
				data: {
					test: 'stuff',
					for: {
						testing: [
							'purposes',
							'only'
						]
					}
				}
			});
		},

		// Uses e.event, e.fingerprint, e.data
		logNewEvent: (e) => {
			GarageDoor.data.db.serialize(() => {
				var stmt = GarageDoor.data.db.prepare(GarageDoor.data.queries.insert.eventLog),
					timestamp = new Date().toString();

				if (!e || !e.event || !e.fingerprint)
					return;
				else if (!e.data)
					e.data = {};

				stmt.run(e.fingerprint, e.event, timestamp, JSON.stringify(e.data));
				stmt.finalize();
			});
		}
	};
}
