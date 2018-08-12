let AGIServer = require('./lib/index');
let uuid = require('node-uuid');

var stepGreeting = function () {            
    log('stepGreeting');
    return context.answer()
        .then(function () {
            if (config.processing['playGreeting']) {
                return context.streamFile(sounds['greeting'], '#');
            } else {
                return Q.resolve();
            }
        });
};        

var stepRecord = function () {
    var conf = config.record,
        filepath = conf['directory'] + '/' + filename;
    var beep = (config.processing['playBeepBeforeRecording']) ? 'beep' : '';

    log('stepRecord', filepath);
    return context.recordFile(filepath, conf['type'], '#', conf['duration'], 0, beep, '');
};

var stepRecognize = function (filename) {
    

        //filename = conf['directory'] + '/' + filename + '.wav';
    log('stepRecognize', filename);
    return recognizer.recognize(file);
};

var stepLookup = function (text) {
    log('stepLookup', text);
    return source.lookup(text);
};        

var stepFinish = function () {
    log('stepFinish');
    return context.end();
};

var stepErrorBeforeFinish = function (error) {
    log('stepError', error);
    return context.streamFile(sounds['onErrorBeforeFinish'], '#');
};

var stepErrorBeforeRepeat = function (error) {
    log('stepRepeatOnError', error);
    return context.streamFile(sounds['onErrorBeforeRepeat'], '#');
};

var stepSuccess = function (object) {            
    log('stepSuccess', object);
    return context.setVariable(dialplanVars['status'], 'SUCCESS')
        .then(function () {
            return context.setVariable(dialplanVars['target'], object.target);
        });
};

var stepSetFailedVars = function () {
    log('stepSetFailedVars');
    return context.setVariable(dialplanVars['status'], 'FAILED');                
};

let handler = function (context) {

    context.onEvent('variables')
        .then(function (vars) {
            console.log('vars', vars);
            return context.streamFile('beep');
        })
        .then(function (result) {
            let filename = uuid.v4();
            context.recordFile(filepath, 'wav', '#', 5000, 0, 'beep', '')
                .then(stepRecognize(filename))
            return context.setVariable('RECOGNITION_RESULT', 'I\'m your father, Luc');
        })
        .then(function (result) {
            return context.end();
        })
        .fail(console.log);
};

var agi = new AGIServer(handler, { debug: true });
agi.start(3000);