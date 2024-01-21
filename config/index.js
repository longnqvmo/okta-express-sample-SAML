const config = {
	saml: {
		cert: 'config/saml.pem',
		entryPoint: 'https://dev-24943231.okta.com/home/dev-24943231_samltestapp_1/0oael5jc40UD9Dyg15d7/alnel5la5tMHkYiWQ5d7',
		issuer: 'http://localhost:1337',
		options: {
			failureRedirect: '/login',
			failureFlash: true,
		},
	},
	server: {
		port: 1337,
	},
	session: {
		resave: false,
		secret: 'supersecretamazingpassword',
		saveUninitialized: true,
	},
};

module.exports = config;
