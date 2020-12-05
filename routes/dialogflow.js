const express = require("express");
const { WebhookClient } = require("dialogflow-fulfillment");
//esporto i nomi delle funzioni mappate
const { welcome,frasi_motivazionali, frasi_motivazionali_yes, frasi_motivazionali_yy, visualizza_spec, prendi_appuntamento, prendi_appuntamento_yes, visualizza_appuntamenti, visualizza_associazioni } = require('../intents/funzioni_callback');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('index', { title: 'Dialogflow' });
  });
router.post('/', express.json(), (req, res) => {  //DialogFLow esegue richieste POST al webhook che gli viene inviato.
                                                  //Tutte le richieste di DialogFlow vengono inviate a questo router.
    const agent = new WebhookClient({ request: req, response: res })
    
    let intentMap = new Map()
    

    //Creo la mappa di associazione "Nome Intent" - "Nome funzione callback"
    intentMap.set("Default Welcome Intent", welcome);
    intentMap.set("Frasi Motivazionali", frasi_motivazionali);
    intentMap.set("Frasi Motivazionali - yes", frasi_motivazionali_yes);
    intentMap.set("Frasi Motivazionali - yes - yes", frasi_motivazionali_yy);
    intentMap.set("Visualizza Specializzazioni", visualizza_spec);
    intentMap.set("Prendi Appuntamento",prendi_appuntamento);
    intentMap.set("Prendi Appuntamento - yes", prendi_appuntamento_yes);
    intentMap.set("Visualizza Appuntamenti", visualizza_appuntamenti);
    intentMap.set("Visualizza Specializzazioni - yes", prendi_appuntamento_yes);
    intentMap.set("Visualizza Associazioni", visualizza_associazioni);

    agent.handleRequest(intentMap);
  })
  

  module.exports = router;
