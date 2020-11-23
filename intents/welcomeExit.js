function welcome(agent) {
    agent.add('Hi, I am assistant. I can help you in various service. How can I help you today?');
}


function defaultFallback(agent) {
    agent.add('Sorry! I am unable to understand this at the moment. I am still learning humans. You can pick any of the service that might help me.');
}

function fissa_appuntamento(agent){
    agent.add('Hai prenotato un appuntamento per le '+ agent.parameters['time']);
}
module.exports = { welcome: welcome, defaultFallback: defaultFallback, fissa_appuntamento: fissa_appuntamento };