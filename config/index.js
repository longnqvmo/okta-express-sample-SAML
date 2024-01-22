const config = {
	saml: {
		cert: 'config/saml.pem',
		entryPoint: '',
		issuer: 'http://localhost:1337',
		options: {
			failureRedirect: '/login',
			failureFlash: true,
		},
	},
	server: {
		port: 1337,
	},
};

module.exports = config;
