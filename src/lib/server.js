module.exports = function(GarageDoor, path, http, express, app, sass, swig){
	Object.assign(GarageDoor, {
		server: {
			defaults: {
				port: 80
			},
			initialize: function(){
				this.startServer();
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
					res.render('index', {DoorIsOpen: false});
				});

				app.get('/license', function(req, res){
					res.sendFile(path.join(GarageDoor.BASE_PATH, 'LICENSE'), {
						headers: {
							'Content-Type': 'text/plain'
						}
					});
				});

				http.listen(this.defaults.port, function(){
					console.log(`Application started on *:${self.defaults.port}`);
				});
			}
		}
	});
}