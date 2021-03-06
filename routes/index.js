module.exports = function (app, mqtt, exphbs, passport, ensureLoggedIn, mongodb) {

	var Client = app.controllers.client;

	function renewSession(request){
		if(request.user){
			if(request.user.keep){
				request.sessionOptions.maxAge = (3 * 24 * 60 * 60 * 1000); //3 dias
			}
			else{
				request.sessionOptions.maxAge = 1200000; //20 min
			}
		}

		return request;
	}

	app.get(['/', '/login'], function(request, response, next){
		request = renewSession(request);

		return response.render('login', {
			layout: 'main'
		});
	});

	app.get(['/dashboard', '/follow', '/publish'],
		ensureLoggedIn(),
		function(request, response, next){
			request = renewSession(request);

			Client.getSubsMessages(request, response, next, request.user);
		}
	);

	app.post(['/', '/login'], app.controllers.client.login);

	app.post('/follow', 
		ensureLoggedIn(), 
		function(request, response, next){
			request = renewSession(request);
			Client.follow(request.user, request.body.followuser);

			Client.getSubsMessages(request, response, next, request.user);
		}
	);

	app.post('/publish', 
		ensureLoggedIn(), 
		function(request, response, next){
			request = renewSession(request);
			Client.publish(request.user, request.body.publishmessage);

			Client.getSubsMessages(request, response, next, request.user);
		}
	);

	app.get('/profile',
		ensureLoggedIn(),
		function(request, response, next){
			request = renewSession(request);

			return response.render('profile', {
				layout: 'home',
				user: request.user
			});
		}
	);


	app.get('/logout',
		function(request, response, next){
			Client.disconnect(request.user);
			request.logout();
			response.redirect('/login');
		}
	);
}