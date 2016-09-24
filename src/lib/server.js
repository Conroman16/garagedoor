var socket = require('socket.io'),
	swig = require('swig'),
	sass = require('node-sass-middleware'),
	express = require('express'),
	ssl = require('letsencrypt-express'),
	spdy = require('spdy'),
	http = require('http'),
	crypto = require('crypto');

module.exports = function(GarageDoor, _, path){

	// AUTHENTICATION
	GarageDoor.auth = {
		sessions: [],
		generateToken: function(callback){
			crypto.randomBytes(64, function(err, buffer){
				var token = buffer.toString('hex');
				callback(token);
			});
		},
		newSession: (token, fingerprint) => {
			var session = _.findWhere(GarageDoor.auth.sessions, {fingerprint: fingerprint});
			if (session){
				session.token = token;
				console.log(`Session refreshed [${fingerprint}]`);
				GarageDoor.data.logSessionRefresh(token, fingerprint);
			}
			else{
				GarageDoor.auth.sessions.push({
					token: token,
					fingerprint: fingerprint
				});
				console.log(`Session authenticated [${fingerprint}]`);
				GarageDoor.data.logSessionAuth(token, fingerprint);
			}
		},
		validateSession: (token, fingerprint) => {
			var existingSession = _.findWhere(GarageDoor.auth.sessions, {token: token, fingerprint: fingerprint});
			if (existingSession)
				return true;
			return false;
		}
	};

	// SOCKETS
	GarageDoor.sockets = {
		initialize: function(){
			this.io = socket.listen(GarageDoor.server.webserver);
			this.setupEvents();
		},
		setupEvents: function(){
			this.io.on('connection', function(socket) {
				console.log(`Socket connected [${socket.handshake.address}]`);
				GarageDoor.data.logSocketConnection(socket);

				socket.on('toggledoorstate', function(data){
					if (!data || !data.fingerprint || !data.token)
						return;

					var token = data.token,
						fingerprint = data.fingerprint;

					if (GarageDoor.auth.validateSession(token, fingerprint)){
						GarageDoor.gpio.toggleDoor();

						GarageDoor.data.logDoorStateToggle(token, fingerprint);
					}
				});

				socket.on('doorauth', (data) => {
					var isGuestCode = data.isGuestCode || false;
					var ret = {
						error: true,
						success: false
					};

					function approveAuthRequest(){
						GarageDoor.auth.generateToken((token) => {
							if (!token){
								socket.emit('doorauthreply', ret);
								return;
							}
							GarageDoor.auth.newSession(token, data.fingerprint);
							socket.emit('doorauthreply', _.extend(ret, {
								error: false,
								success: true,
								token: token
							}));
						});
					}

					if (!data || !data.fingerprint || !data.pin)
						socket.emit('doorauthreply', ret);

					if (isGuestCode){
						GarageDoor.data.getGuestPermission(data.pin).then((guest) => {
							if (guest && !guest.inactive)
								approveAuthRequest();
						});
					}
					else if (data.pin == GarageDoor.config.doorcode)
						approveAuthRequest();
					else
						socket.emit('doorauthreply', _.extend(ret, {error: false}));
				});
			});
		}
	};

	// SERVER
	GarageDoor.server = {
		defaults: {
			port: 80,
			sslPort: 443
		},
		initialize: function(){
			this.configureSSL();
			this.startServer();
		},
		configureSSL: function(){
			this.ssl = ssl.create({
				server: GarageDoor.isDev ? 'staging' : GarageDoor.config.ssl.ca_url,
				configDir: GarageDoor.SSL_DATA_PATH,
				approveDomains: (opts, certs, cb) => {
					if (certs)
						opts.domains = certs.altnames;
					else{
						_.extend(opts, {
							agreeTos: true,
							email: GarageDoor.config.ssl.email,
							domains: GarageDoor.config.ssl.domains
						});
					}

					cb(null, {
						options: opts,
						certs: certs
					});
				}
			});
		},
		startSockets: function(){
			GarageDoor.sockets.initialize();
		},
		startServer: function(){
			var self = this,
				app = express();

			app.engine('swig', swig.renderFile);
			app.set('view engine', 'swig');
			app.set('views', GarageDoor.VIEWS_PATH);

			app.use(sass({
				src: path.join(GarageDoor.STATIC_FILES_PATH, 'style'),
				dest: path.join(GarageDoor.STATIC_FILES_PATH, 'css'),
				outputStyle: GarageDoor.isDev ? 'expanded' : 'compressed',
				prefix: '/static/css'
			}));

			app.use('/static', express.static(GarageDoor.STATIC_FILES_PATH));

			app.get('/', function(req, res){
				res.render('index', {
					DoorIsOpen: !GarageDoor.gpio.doorIsClosed,
					WundergroundApiKey: GarageDoor.config.apikeys.wunderground,
					Location: GarageDoor.config.location,
					PinLength: GarageDoor.config.doorcode.length
				});
			});

			app.get(/\/license(\.txt)?/i, function(req, res){
				res.sendFile(path.join(GarageDoor.BASE_PATH, 'LICENSE'), {
					headers: {
						'Content-Type': 'text/plain'
					}
				});
			});

			this.webserver = spdy.createServer(this.ssl.httpsOptions, this.ssl.middleware(app)).listen(this.defaults.sslPort, () => {
				console.log(`Application started on *:${self.defaults.sslPort}`);
			});

			this.webserver.httpsRedirector = http.createServer((req, res) => {
				var host = req.headers.host,
					url = req.url;

				res.writeHead(301, {
					Location: `https://${host}${url}`
				});
				res.end();
			}).listen(this.defaults.port, () => {
				console.log(`HTTPS redirector started on *:${self.defaults.port}`);
			});

			this.startSockets();
		}
	};
}
