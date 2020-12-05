const { stringify } = require("actions-on-google/dist/common");
const { Payload } = require("dialogflow-fulfillment");
const firebase = require("firebase");                           //aggiunta requirements
const admin = require("firebase-admin");
const firebaseConfig = {
    apiKey: "AIzaSyCynnUqwsqSBoQg_m_1cQ4JfRiQroAbrvw",
    authDomain: "progettotelegrambot.firebaseapp.com",
    databaseURL: "https://progettotelegrambot.firebaseio.com",
    projectId: "progettotelegrambot",
    storageBucket: "progettotelegrambot.appspot.com",
    messagingSenderId: "566202342848",
    appId: "1:566202342848:web:a501271af878ffcbdcbc25"
  };
  firebase.initializeApp(firebaseConfig);   //connessione database firebase

var db = firebase.firestore();

function welcome(agent){

}

// INTENT FRASI MOTIVAZIONALI

function frasi_motivazionali(agent){      //Intent Frazi Motivazionali
    var umore = agent.parameters.umore;
    var ris = "";
    switch(umore) //Switch in base all'entity che arriva come parametro
    {
        case "felice":
            ris += 'Sono contento che tu sia felice, '+ agent.parameters["nome"];
            break;
        case "triste":
            ris += 'Hai bisogno di una mano ' + agent.parameters["nome"]+ '?'; //Trigger intent "Frasi Motivazionali Yes - No"
            break;
        case "ansia":
            ris += 'Non stare in ansia '+ agent.parameters["nome"];
            break;
        case "arrabbiato":
            ris += 'Oh cazzo oh merda no ti prego '+agent.parameters["nome"]+' non picchiarmi';
            break;
        case "male":
            ris += "Mi dispiace che tu ti senta così, "+ agent.parameters["nome"]+ "\nHai bisogno di una mano?";
            break;
    

    }
    if(umore != "triste") //Se l'umore non è triste invia i bottoni
    {
        var payload = {
            "telegram": {
              "reply_markup": {
                "inline_keyboard": [
                  [
                    {
                      "text": "Visualizza una lista degli specialisti",
                      "callback_data": "lista specialisti"
                      
                    }
                  ],
                  [
                    {
                      "text": "Prenota un appuntamento con uno specialista",
                      "callback_data": "prenota un appuntamento"
                    }
                  ],
                  [
                    {
                      "callback_data": "frase motivazionale",
                      "text": "Chiedimi una frase motivazionale"
                    }
                  ],
                  [
                    {
                      "callback_data": "gruppo telegram",
                      "text": "Chiedimi di inserirti nel gruppo di supporto"
                    }
                  ],
                  [
                    {
                      "text": "Visualizza le associazioni di supporto",
                      "callback_data": "fammi vedere le associazioni"
                    }
                  ]
                ]
              },
              "text": ris + "\nEcco la lista delle azioni che puoi compiere😎"
            }
          };
        agent.add(new Payload(agent.UNSPECIFIED,payload,{ rawPayload: true, sendAsMessage: true}));
    }
    agent.add(ris);
    
}

async function frasi_motivazionali_yes (agent) { //Se l'utente ha bisogno di aiuto mostra le onlus
    var ris = "";
    ris = await query_onlus();
    agent.add(ris+"Vuoi prendere un appuntamento con uno dei nostri specialisti?"); //Trigger Frasi Motivazionali yes yes
}
async function frasi_motivazionali_yy(agent){ //Invia la lista di tutti gli specialisti
    var ris = await query_db_contatti();
    agent.add(ris);
     
}

// INTENT VISUALIZZA SPECIALIZZAZIONE

async function visualizza_spec(agent){ //Visualizza la lista degli specialisti per professione
    var nome = agent.parameters["nome"];
    var professione = agent.parameters["professione"];
    console.log(professione);
    
    var ris  = nome+ ", ecco la lista degli specialisti disponibili per quello che stai cercando\n\n";
    ris+= await query_db_professioni(professione); 
    ris+= "\n\nVuoi prendere un appuntamento con uno di loro?" 
    agent.add(ris);
}

// INTENT PRENDI APPUNTAMENTO

async function prendi_appuntamento(agent){ //funzione per prenotare un appuntamento con un certo tipo di specialisti
    var professione = agent.parameters["professione"];
    var ris  = agent.parameters["nome"]+ ", ecco la lista degli specialisti disponibili per quello che stai cercando\n\n";
    ris+= await query_db_professioni(professione);
    ris+= "\n\nVuoi prendere un appuntamento con uno di loro?"; //Trigger Prendi Appuntamento yes
    agent.add(ris);
}
async function prendi_appuntamento_yes(agent){ //funzione per prendere un appuntamentp
    var nome = agent.parameters["nome"];
    var nome_specialista = agent.parameters["nome_spec"];
    var professione = agent.parameters["professione"];
    var data = agent.parameters["data"];                  //ottengo tutti i parametri che mi servono
    var ora = agent.parameters["ora"];
    var piattaforma = agent.parameters["piattaforma"];
    var tmp= data.split("T");                             //magiche magie per dividere una stringa GG:MM:AAAATHH:MM:SS+01 in data e ora
    data = tmp[0];
    var tmp1 = ora.split("T");
    var tmp2 = tmp1[1].split("+");
    ora = tmp2[0];
    const dataset = {
        Paziente: nome,
        Data: data,
        Ora: ora,
        Specialista: nome_specialista,
        Piattaforma: piattaforma
    }
    db.collection('Appuntamenti').add(dataset);
    
    agent.add("Bene, ho preso un appuntamento con "+ nome_specialista + " per il "+ data +" alle ore "+ora+ " via "+ piattaforma );
   
        
}
async function visualizza_yes(agent){
   //Questo intent è gestito dal server Node ma è reindirizzato alle stesse funzioni dell'intent "Prendi appuntamento - yes"
}

//INTENT VISUALIZZA APPUNTAMENTI
async function visualizza_appuntamenti(agent){ //Intent Visualizza Appuntamenti
    var ris = "";
    ris += await visualizza_db(agent.parameters["nome"]);
    agent.add("Ecco a te "+ agent.parameters["nome"]+ "\n\n" +ris+ "Ricorda che puoi chiedermi in qualsiasi momento di prendere una nuova prenotazione!");
}


//QUERY DB
async function query_onlus() //query per la lista di tutte le associazioni
{
    return db.collection('Associazioni').get().then(function(querySnapshot) {
        var tmp = "Ecco la lista di tutti i servizi e associazioni che possono aiutarti a stare meglio\n\n";
        querySnapshot.forEach(doc=> tmp+="Nome: " + doc.data().Nome + "\nSito: " + doc.data().Sito + "\nNumero di telefono: " + doc.data().Numero + "\n\n");
        return tmp;
        });
}

async function query_db_contatti(){ //query per la lista di tutti gli specialsti
    return db.collection('Contatti').get().then(function(querySnapshot) {
        var tmp = "Ecco la lista dei nostri specialisti\nSentiti libero di chiedermi di prenotarti un appuntamento da uno di loro\n\n";
        querySnapshot.forEach(doc=> tmp+="Nome: " + doc.data().Nome + "\nProfessione: " + doc.data().Professione + "\nDisponibilità: " + doc.data().Disponibile + "\nNumero di Telefono: "+doc.data().Numero+"\nSito: "+doc.data().Sito+"\n\n");
        return tmp;
        });
}

async function query_db_professioni(professione){ //query per trovare tutti gli specialisti di una professione
  if(professione != "*")
  {
  return db.collection('Contatti').where("Professione","==",professione).get().then(function(querySnapshot) {
      var tmp ="";
      querySnapshot.forEach(doc=> tmp+="Nome: " + doc.data().Nome + "\nProfessione: " + doc.data().Professione + "\nDisponibilità: " + doc.data().Disponibile + "\nNumero di Telefono: "+doc.data().Numero+"\nSito: "+doc.data().Sito+"\n\n");
      return tmp;
      });
  }
  else
  {
    return db.collection('Contatti').get().then(function(querySnapshot) {
      var tmp ="";
      querySnapshot.forEach(doc=> tmp+="Nome: " + doc.data().Nome + "\nProfessione: " + doc.data().Professione + "\nDisponibilità: " + doc.data().Disponibile + "\nNumero di Telefono: "+doc.data().Numero+"\nSito: "+doc.data().Sito+"\n\n");
      return tmp;
      });
  }
}
async function visualizza_db(nome) //query per gli appuntamenti
{
    return db.collection("Appuntamenti").where("Paziente","==",nome).get().then(function(querySnapshot) {
        var tmp ="";
        querySnapshot.forEach(doc=> tmp+="Specialista: " + doc.data().Specialista + "\nPiattaforma: " + doc.data().Piattaforma + "\nData: " + doc.data().Data + "\nOra: "+doc.data().Ora+"\n\n");
        console.log(tmp);
        return tmp;

        });
}
module.exports = { welcome: welcome, frasi_motivazionali: frasi_motivazionali, frasi_motivazionali_yes: frasi_motivazionali_yes, frasi_motivazionali_yy: frasi_motivazionali_yy, visualizza_spec: visualizza_spec, prendi_appuntamento: prendi_appuntamento, prendi_appuntamento_yes: prendi_appuntamento_yes, visualizza_appuntamenti: visualizza_appuntamenti, visualizza_yes: visualizza_yes};