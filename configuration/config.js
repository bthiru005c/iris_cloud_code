// Run-time updates to this file will not be reflected in the program as explained in 
// http://stackoverflow.com/questions/16710181/change-configuration-in-runtime-by-changing-environment-variables-using-the-modu
module.exports = {
	development: {
		interface : 'eth0', // or ethernet interface. ex: eth0, eth1, lo...
		port : '443',	// MUST specify port if ssl_enabled is false, If true, the port is ALWAYS 443
		ssl_enabled : true,	// if true, interface CANNOT be 'lo'
		ssl_private_key: '/home/centos/certs/poc.key',		// absolute/relative PATH + key file - relative PATH starts from the base directory
		ssl_certificate: '/home/centos/certs/poc.crt',	// absolute/relative PATH + cert file - relative PATH starts from the base directory		
		event_manager: 'https://st-evmgr-asb-001.poc.sys.comcast.net',
		notification_manager: 'st-nm-asb-001.poc.sys.comcast.net',
		triggers_file: '/home/centos/iris_cloud_code/configuration/triggers.json',
		// Logging configuration
		log: {
			console: {
				enabled: true,
				level: 'info',
				colorize: false
			},
			plaintext: {
				enabled: true,
				level: 'info',
				filename: 'nm.log.log',
				dirname: './log',
				maxsize: 10485760    // 10mb before rotating to another file
			}
		},
	},
	test: {},
	production: {}
};
