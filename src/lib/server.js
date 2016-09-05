var socket = require('socket.io'),
	swig = require('swig'),
	sass = require('node-sass-middleware'),
	express = require('express'),
	ssl = require('letsencrypt-express'),
	spdy = require('spdy'),
	http = require('http'),
	crypto = require('crypto');

module.exports = function(GarageDoor, path){
	Object.assign(GarageDoor, {
		auth: {
			sessions: [],
			generateToken: function(callback){
				var token;
				crypto.randomBytes(64, function(err, buffer){
					var token = buffer.toString('hex');
					callback(token);
				});
			},
			newSession: (token, fingerprint) => {
				var sessionExists = false,
					session;
				for (var i = 0; i < GarageDoor.auth.sessions.length; i ++){
					var t = GarageDoor.auth.sessions[i];

					if (t.fingerprint == fingerprint){
						sessionExists = true;
						session = t;
						break;
					}
				}

				if (sessionExists){
					t.token = token;
				}
				else{
					GarageDoor.auth.sessions.push({
						token: token,
						fingerprint: fingerprint
					});
				}
			},
			validateSession: (token, fingerprint) => {
				for (var i = 0; i < GarageDoor.auth.sessions.length; i++){
					var t = GarageDoor.auth.sessions[i];
					if (t.token == token && t.fingerprint == fingerprint)
						return true;
				}
				return false;
			}
		},
		sockets: {
			initialize: function(){
				this.io = socket.listen(GarageDoor.server.webserver);
				this.setupEvents();
			},
			setupEvents: function(){
				this.io.on('connection', function(socket) {
					console.log(`Socket connected [${socket.handshake.address}]`);

					socket.on('toggledoorstate', function(data){
						if (!data || !data.fingerprint || !data.token)
							return;

						if (GarageDoor.auth.validateSession(data.token, data.fingerprint))
							GarageDoor.gpio.toggleDoor();
					});

					socket.on('doorauth', (data) => {
						var ret = {
							error: true,
							success: false
						};
						if (!data || !data.fingerprint || !data.pin)
							socket.emit('doorauthreply', ret);

						if (data.pin == GarageDoor.config.doorcode){
							GarageDoor.auth.generateToken((token) => {
								if (!token)
									socket.emit('doorauthreply', ret);

								GarageDoor.auth.newSession(token, data.fingerprint);

								socket.emit('doorauthreply', Object.assign(ret, {
									error: false,
									success: true,
									token: token
								}));
							});
						}
						else
							socket.emit('doorauthreply', Object.assign(ret, {error: false}));
					});
				});
			}
		},
		server: {
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
					server: GarageDoor.isDev ? 'staging' : GarageDoor.LETSENCRYPT_CA_URL,
					configDir: GarageDoor.SSL_DATA_PATH,
					approveDomains: (opts, certs, cb) => {
						if (certs)
							opts.domains = certs.altnames;
						else{
							Object.assign(opts, {
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
					outputStyle: 'compressed',
					prefix: '/static/css'
				}));

				app.use('/static', express.static(GarageDoor.STATIC_FILES_PATH));

				app.get('/', function(req, res){
					res.render('index', {
						DoorIsOpen: !GarageDoor.gpio.doorIsClosed,
						WundergroundApiKey: GarageDoor.config.apikeys.wunderground,
						Location: GarageDoor.config.location
					});
				});

				app.get('/license', function(req, res){
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
		}
	});
}
