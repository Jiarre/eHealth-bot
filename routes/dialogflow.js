const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");
const { welcome,frasi_motivazionali, frasi_motivazionali_yes, frasi_motivazionali_yy, visualizza_spec, prendi_appuntamento, prendi_appuntamento_yes, visualizza_appuntamenti, visualizza_yes } = require('../intents/funzioni_callback');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Dialogflow' });
  });
router.post('/', express.json(), (req, res) => {
    const agent = new WebhookClient({ request: req, response: res })
    
    let intentMap = new Map()
    
    intentMap.set("Default Welcome Intent", welcome);
    intentMap.set("Frasi Motivazionali", frasi_motivazionali);
    intentMap.set("Frasi Motivazionali - yes", frasi_motivazionali_yes);
    intentMap.set("Frasi Motivazionali - yes - yes", frasi_motivazionali_yy);
    intentMap.set("Visualizza Specializzazioni", visualizza_spec);
    intentMap.set("Prendi Appuntamento",prendi_appuntamento);
    intentMap.set("Prendi Appuntamento - yes", prendi_appuntamento_yes);
    intentMap.set("Visualizza Appuntamenti", visualizza_appuntamenti);
    intentMap.set("Visualizza Specializzazioni - yes", prendi_appuntamento_yes);
  
    agent.handleRequest(intentMap);
  })
  

  module.exports = router;
