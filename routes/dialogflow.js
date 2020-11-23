const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");
const { welcome, fissa_appuntamento, defaultFallback } = require('../intents/welcomeExit');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Dialogflow' });
  });
router.post('/', express.json(), (req, res) => {
    const agent = new WebhookClient({ request: req, response: res })
    

    
  
    let intentMap = new Map()
    intentMap.set('Fissa un appuntamento', fissa_appuntamento);
    intentMap.set("Default Welcome Intent", welcome);
    intentMap.set("Default Fallback Intent", defaultFallback);
    agent.handleRequest(intentMap);
  })
  

  module.exports = router;
