module.exports = function(GarageDoor, path, http, express, app, sass, swig){
	Object.assign(GarageDoor, {
		server: {
			initialize: function(){
				app.engine('swig', swig.renderFile);
				app.set('view engine', 'swig');
				app.set('views', GarageDoor.VIEWS_PATH);

				app.use(sass({
					src: path.join(GarageDoor.STATIC_FILES_PATH, 'style'),
					dest: path.join(GarageDoor.STATIC_FILES_PATH, 'css'),
					debug: true,
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

				http.listen(1693, function(){
					console.log('Application started on *:1693');
				});
			}
		}
	});
}