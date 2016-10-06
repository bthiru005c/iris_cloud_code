var express = require('express'),
    bodyParser = require('body-parser'),
    _ = require('underscore'),
    //json = require('./configuration/triggers.json'),
    routes = require('./server/routes'),
    eventManager = require('./server/eventmanagercloud'),
    app = express();
    
app.set('port', process.env.PORT || 6707);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var router = new express.Router();
routes(app);
app.use('/', router);

var server = app.listen(app.get('port'), '127.0.0.1', function() {
    console.log('Event Manager Cloud Code server up: ' + server.address().address + ':' + app.get('port'));
});

var handleShutdown = function() {
    console.log('EM Cloud Code server shutting down...');
    eventManager.removeAllFunctions();
    eventManager.removeAllTriggers();
    server.close(function() {
        process.exit(0);
    });
};

process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);