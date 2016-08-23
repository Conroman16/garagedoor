module.exports = function(GarageDoor, http, express, app, swig){
	GarageDoor.server = {
		initialize: function(){
			app.engine('swig', swig.renderFile);
			app.set('view engine', 'swig');
			app.set('views', GarageDoor.VIEWS_PATH);

			app.use('/static', express.static(GarageDoor.STATIC_FILES_PATH));

			app.get('/', function(req, res){
				res.render('index', {DoorIsOpen: false});
			});

			http.listen(1693, function(){
				console.log('Application started on *:1693');
			});
		}
	}
}