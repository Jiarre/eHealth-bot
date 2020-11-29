const { stringify } = require("actions-on-google/dist/common");
const firebase = require("firebase");
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
  firebase.initializeApp(firebaseConfig);

var db = firebase.firestore();

async function welcome(agent) {
    agent.add("Ciao" + agent.parameters["nome"] + "sono ConTe bla bla bla");
}






function frasi_motivazionali(agent){
    var umore = agent.parameters.umore;
    ris = "";
    switch(umore)
    {
        case "felice":
            ris += 'Sono contento che tu sia felice, '+ agent.parameters["nome"];
            break;
        case "triste":
            ris += 'Hai bisogno di una mano ' + agent.parameters["nome"]+ '?';
            break;
        case "ansia":
            ris += 'Non stare in ansia '+ agent.parameters["nome"];
            break;
        case "arrabbiato":
            ris += 'Oh cazzo oh merda no ti prego '+agent.parameters["nome"]+' non picchiarmi';
            break;
        case "male":
            ris += "Mi dispiace che tu ti senta così, "+ agent.parameters["nome"];
            break;
        default:
            ris += "Non male, "+ agent.parameters["nome"] + " continua così!"

    }
    if(umore != "triste")
    {
        ris+= "\nEcco la lista delle azioni che puoi compiere:\n  >Visualizzare i nostri specialisti\n  >Prendere e visualizzare appuntamenti\n  >Chiedermi una frase motivazionale\n  >Chiedermi di aggiungerti nel gruppo di supporto\n  >Visualizzare le associazioni di supporto\n\nE molte altre funzioni sono in arrivo! Sentiti libero di chiedermi qualsiasi di queste cose quando ne hai voglia";
    }
    agent.add(ris);
    
}

function frasi_motivazionali_yes (agent) {

    agent.add(agent.parameters["nome"]+" mi dispiace che tu ne abbia bisogno, ma farò il possibile. Ecco l'elenco di tutti i servizi che conosco: \n\nOnlus 1: 3491146276 \nOnlus 2: www.federicogiarre.it \n\nIn alternativa puoi prendere appuntamento con uno dei nostri specialisti.\nVuoi vedere la lista degli specialisti?");
}
async function frasi_motivazionali_yy(agent){
    var ris = await query_db_contatti();
    agent.add(ris);
     
}

async function query_db_contatti(){
    return db.collection('Contatti').get().then(function(querySnapshot) {
        var tmp = "Ecco la lista dei nostri specialisti\nSentiti libero di chiedermi di prenotarti un appuntamento da uno di loro\n\n";
        querySnapshot.forEach(doc=> tmp+="Nome: " + doc.data().Nome + "\nProfessione: " + doc.data().Professione + "\nDisponibilità: " + doc.data().Disponibile + "\nNumero di Telefono: "+doc.data().Numero+"\nSito: "+doc.data().Sito+"\n\n");
        return tmp;
        });
}
async function visualizza_spec(agent){
    var nome = agent.parameters["nome"];
    var professione = agent.parameters["professione"];
    console.log(professione);
    if(professione == null)
    {
        professione = "*";
    }
    var ris  = nome+ ", ecco la lista degli specialisti disponibili per quello che stai cercando\n\n";
    ris+= await query_db_professioni(professione);
    ris+= "\n\nVuoi prendere un appuntamento con uno di loro?"
    agent.add(ris);
}
async function query_db_professioni(professione){
    return db.collection('Contatti').where("Professione","==",professione).get().then(function(querySnapshot) {
        var tmp ="";
        querySnapshot.forEach(doc=> tmp+="Nome: " + doc.data().Nome + "\nProfessione: " + doc.data().Professione + "\nDisponibilità: " + doc.data().Disponibile + "\nNumero di Telefono: "+doc.data().Numero+"\nSito: "+doc.data().Sito+"\n\n");
        return tmp;
        });
}

async function prendi_appuntamento(agent){
    var professione = agent.parameters["professione"];
    var ris  = agent.parameters["nome"]+ ", ecco la lista degli specialisti disponibili per quello che stai cercando\n\n";
    ris+= await query_db_professioni(professione);
    ris+= "\n\nVuoi prendere un appuntamento con uno di loro?";
    agent.add(ris);
}
async function prendi_appuntamento_yes(agent){
    var nome = agent.parameters["nome"];
    var nome_specialista = agent.parameters["nome_spec"];
    var professione = agent.parameters["professione"];
    var data = agent.parameters["data"];
    var ora = agent.parameters["ora"];
    var piattaforma = agent.parameters["piattaforma"];
    var tmp= data.split("T");
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
            console.log(dataset);
            db.collection('Appuntamenti').add(dataset);
    
 
    
        agent.add("Bene, ho preso un appuntamento con "+ nome_specialista + " per il "+ data +" alle ore "+ora+ " via "+ piattaforma );
   
        
}
async function visualizza_yes(agent){
    agent.add("hi bro");
}
/*async function query_nome_specialisti(nome_specialista, professione, data, ora ,nome, piattaforma){
    return db.collection('Contatti').where("Nome","==",nome_specialista).where("Professione","==",professione).get().then(function(querySnapshot) {
        querySnapshot.forEach(doc=>{
            var tmp= data.split("T");
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
            console.log(dataset);
            db.collection('Appuntamenti').add(dataset);
            
        }); 
        return 1; 
        });
}*/
async function visualizza_appuntamenti(agent){
    var ris = "";
    ris += await visualizza_db(agent.parameters["nome"]);
    agent.add("Ecco a te "+ agent.parameters["nome"]+ "\n\n" +ris+ "Ricorda che puoi chiedermi in qualsiasi momento di prendere una nuova prenotazione!");
}
async function visualizza_db(nome)
{
    return db.collection("Appuntamenti").where("Paziente","==",nome).get().then(function(querySnapshot) {
        var tmp ="";
        querySnapshot.forEach(doc=> tmp+="Specialista: " + doc.data().Specialista + "\nPiattaforma: " + doc.data().Piattaforma + "\nData: " + doc.data().Data + "\nOra: "+doc.data().Ora+"\n\n");
        console.log(tmp);
        return tmp;

        });
}


module.exports = { welcome: welcome, frasi_motivazionali: frasi_motivazionali, frasi_motivazionali_yes: frasi_motivazionali_yes, frasi_motivazionali_yy: frasi_motivazionali_yy, visualizza_spec: visualizza_spec, prendi_appuntamento: prendi_appuntamento, prendi_appuntamento_yes: prendi_appuntamento_yes, visualizza_appuntamenti: visualizza_appuntamenti, visualizza_yes: visualizza_yes};