# Skill Alexa per l'interrogazione di Wikidata (Knowledge Graph)
L’avvento dell’era digitale ha portato ad un’esplosione di informazioni sottoforma di notizie, articoli, social media e così via. Ogni individuo dotato di un dispositivo elettronico produce inconsapevolmente, ogni giorno, migliaia di dati. 
E' necessario modellare i dati in modo che possano essere interrogati facilmente. Un approccio possibile è modellarli attraverso un Knowledge Graph (con l'acronimo KG), sebbene non vi sia una definizione chiara di KG, un'interpretazione comune è che esso rappresenta una raccolta di descrizioni interconnesse di entità: oggetti del mondo reale, eventi, situazioni o concetti astratti. Spesso contengono grandi volumi di informazioni fattuali con semantica meno formale. In alcuni contesti, il termine Knowledge Graph viene utilizzato per riferirsi a qualsiasi Knowledge base rappresentata come grafo. Esso costituisce dunque un ambiente volto a facilitare la raccolta, l'organizzazione e la distribuzione della conoscenza. Un'ulteriore classificazione distingue KG proprietari e quelli gestiti da community, possono essere specializzate o general purpose.
Ma per interrogare i KG sono necessari linguaggi come SPARQL che si rivelano essere non alla portata di tutti. SPARQL si è affermato tra i principali strumenti di interrogazione nonostante la sua complessità. Nasce così la necessità di rendere accessibili questi dati anche per persone senza competenze tecniche in query language, in generale, e SPARQL, in particolare.
Quindi, come fare per creare un servizio per l’interrogazione di Knowledge Graph note, come Wikidata o DBpedia, attraverso interfacce facilmente usabili e che non richiedano competenze tecniche?
Tra i diversi approcci che semplificano l’interazione utente ci sono gli assistenti vocali, molto popolari negli ultimi anni, che rappresentano un modo facile e intuitivo per l’interazione in linguaggio naturale e per l’erogazione di servizi di un’applicazione.

Secondo una previsione degli analisti britannici di Juniper Research, l'uso degli assistenti vocali è destinato a triplicare nei prossimi anni. L'azienda stima che ci saranno 8 miliardi di assistenti vocali digitali in uso entro il 2023, rispetto ai 2,5 miliardi del 2018.
E' quindi evidente che l’utilizzo della tecnologia di riconoscimento vocale è la prossima grande frontiera. Amazon Alexa è la tecnologia oggi in testa alle classifiche con una quota di mercato del 73%.
Per questi motivi l'assistente vocale scelto è Alexa, mentre la Knowledge Graph scelta per l’interrogazione è Wikidata, definita come una knowledge base online collaborativa, sostenuta e ospitata dalla Wikimedia Foundation, scelta per l'efficacia delle API fornite.
Quindi un utente effettua delle domande ad un assistente vocale in linguaggio naturale, la skill riconosce le parole chiave, viene generata la query SPARQL sul Knowledge Graph e recupera le informazioni richieste.
Che tipo di domande può effettuare l'utente? Le domande sono modellate basandoci sulla cosiddetta regola delle 5 W, cioè la regola principale dello stile giornalistico anglosassone e delle regole di buona formazione del discorso, Who, What, When, Where, Why.
Al fine di una valutazione corretta della skill si è scelto di effettuare testing su un dataset ufficiale di domande risposte su Wikidata.


L’obiettivo di tesi è dunque: la creazione di una skill Alexa per permettere l’interrogazione (in linguaggio naturale) di un Knowledge Graph, cioè Wikidata.
----

# Istruzioni per l'import
- copiare e incollare il contenuto del file "interactionModel.json" nel JSON editor dell'Alexa Developer Console;
- import del file zip "Alexa.zip", contenente le librerie e il back-end in NodeJS, nella lambda function di AWS;
- collegare il modello di interazione e la lambda function con l'end point nell'Alexa Developer Console.

<img  height="400" src="https://github.com/mario-santoro/wikidata-skill-alexa/blob/master/img/dinfunisa.jpeg">
La skill è disponibile online nello store inglese al link:
https://www.amazon.co.uk/Mario-wikidata/dp/B082M5ZH4T/ref=sr_1_1?keywords=wikidata+skill&qid=1579081541&sr=8-1
