module.exports = function(GarageDoor, path, spdy, ssl, express, app, socket, sass, swig){
	Object.assign(GarageDoor, {
		sockets: {
			initialize: function(){
				this.setupEvents();
			},
			setupEvents: function(){
				io.on('connection', function(socket) {
					console.log(`Socket connected [${socket.handshake.address}]`);

					socket.on('toggledoorstate', function(data){
						GarageDoor.gpio.toggleDoor();
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
				this.startServer();
			},
			configureSSL: function(){
				this.ssl = ssl.create({
					server: 'staging',
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
				io = socket.listen(this.webserver);
				GarageDoor.sockets.initialize();
			},
			startServer: function(){
				var self = this;

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
					GarageDoor.gpio.doorIsOpen(function(value){
						res.render('index', {
							DoorIsOpen: value,
							WundergroundApiKey: GarageDoor.config.apikeys.wunderground,
							Location: GarageDoor.config.location
						});
					});
				});

				app.get('/license', function(req, res){
					res.sendFile(path.join(GarageDoor.BASE_PATH, 'LICENSE'), {
						headers: {
							'Content-Type': 'text/plain'
						}
					});
				});

				this.configureSSL();

				this.webserver = spdy.createServer(this.ssl.httpsOptions, this.ssl.middleware(app)).listen(this.defaults.sslPort, () => {
					console.log(`Application started on *:${self.defaults.sslPort}`);
				});

				this.startSockets();
			}
		}
	});
}
