
const Alexa = require("ask-sdk");
const https = require("https");
var request = require('sync-request');
 const wbk = require('wikibase-sdk')({
  instance: 'https://www.wikidata.org',
  sparqlEndpoint: 'https://query.wikidata.org/sparql'
});
const invocationName = "querying  wikidata";
var array=[];


function getMemoryAttributes() {   const memoryAttributes = {
       "history":[],

        // The remaining attributes will be useful after DynamoDB persistence is configured
       "launchCount":0,
       "lastUseTimestamp":25,
       "lastSpeechOutput":{},
       "nextIntent":[]

   };
   return memoryAttributes;
};

const maxHistorySize = 25; // remember only latest 20 intents 


// 1. Intent Handlers =============================================

const LaunchRequest_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;

        let say = 'Hi!!' + ' Welcome to ' + invocationName + '! Ask me question type: what is the capital of Italy?';

        let skillTitle = capitalize(invocationName);


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .withStandardCard('Welcome!', 'Hi!\nThis is your skill, ' + skillTitle, welcomeCardImg.smallImageUrl, welcomeCardImg.largeImageUrl)
            .getResponse();
    },
};



const AMAZON_CancelIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_HelpIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        //let intents = getCustomIntents();
        //let sampleIntent = randomElement(intents);

        let say = 'You asked for help. '; 

        //say += ' Here something you can ask me, ' + getSampleUtterance(sampleIntent);
        say += ' Here something you can ask me, who is the author of harry potter? ';
        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_StopIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, see you soon! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_NavigateHomeIntent_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NavigateHomeIntent' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.NavigateHomeIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const getResult_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'getResult' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'The ';

        let slotStatus = '';
        let resolvedSlot;
        var entity='';
        var property='';
        let slotValues = getSlotValues(request.intent.slots); 
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: property 
        if (slotValues.property.heardAs) {
            
            slotStatus += slotValues.property.heardAs+" ";
            property=slotValues.property.heardAs ;
        } else {
            slotStatus += 'property empty ';
        }
        if (slotValues.property.ERstatus === 'ER_SUCCESS_MATCH') {
           
            if(slotValues.property.resolved !== slotValues.property.heardAs) {
                slotStatus += slotValues.property.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.property.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.property.heardAs + '" to the custom slot type used by slot stato! '); 
        }

        if( (slotValues.property.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.property.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getResult','property'), 'or');
        }

       


        //   SLOT: entity 
        if (slotValues.entity.heardAs) {
            slotStatus += 'of ' + slotValues.entity.heardAs + ' ';
            entity=slotValues.entity.heardAs ;
        } else {
            slotStatus += 'entity is empty. ';
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_MATCH') {
           
            if(slotValues.entity.resolved !== slotValues.entity.heardAs) {
              //  slotStatus += 'synonym for ' + slotValues.entity.resolved + '. '; 
                } else {
               // slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.entity.heardAs + '" to the custom slot type used by slot entity! '); 
        }

        if( (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.entity.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getResult','entity'), 'or');
        }

        say += slotStatus;
    
    var p=getProperty(property);
   

    var ide= getEntity(entity);
   

    const res =  getResultQuery(ide,p);
    
          say += res;
  
        return responseBuilder
            .speak(say+". Do you have more questions?")
            .reprompt('more question?')
            .getResponse();
    },
};

const getResultReverse_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'getResultReverse' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'The ';

        let slotStatus = '';
        let resolvedSlot;
        var entity='';
        var property='';
        let slotValues = getSlotValues(request.intent.slots); 
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: property 
        if (slotValues.property.heardAs) {
            
            slotStatus += slotValues.property.heardAs+" ";
            property=slotValues.property.heardAs ;
        } else {
            slotStatus += 'property empty ';
        }
        if (slotValues.property.ERstatus === 'ER_SUCCESS_MATCH') {
            //slotStatus += 'a valid ';
            if(slotValues.property.resolved !== slotValues.property.heardAs) {
              //  slotStatus += 'synonym for ' + slotValues.property.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.property.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.property.heardAs + '" to the custom slot type used by slot stato! '); 
        }

        if( (slotValues.property.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.property.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getResultReverse','property'), 'or');
        }

       


        //   SLOT: entity 
        if (slotValues.entity.heardAs) {
            slotStatus += 'of ' + slotValues.entity.heardAs + ' ';
            entity=slotValues.entity.heardAs ;
        } else {
            slotStatus += 'entity is empty. ';
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_MATCH') {
        //    slotStatus += 'a valid ';
            if(slotValues.entity.resolved !== slotValues.entity.heardAs) {
            //    slotStatus += 'synonym for ' + slotValues.entity.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.entity.heardAs + '" to the custom slot type used by slot entity! '); 
        }

        if( (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.entity.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getResultReverse','entity'), 'or');
        }

        say += slotStatus;
    
        var p=getProperty(property);
   

        var ide= getEntity(entity);
   
        const res =  getResulQueryReverse(ide,p);
    
          say += res;
  
        return responseBuilder
         .speak(say+". Do you have more questions?")
            .reprompt('more question?')
            .getResponse();
    },
};

const getDescription_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'getDescription' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = '';

        let slotStatus = '';
        let resolvedSlot;
        var entity='';
        var property='';
        let slotValues = getSlotValues(request.intent.slots); 



        //   SLOT: entity 
        if (slotValues.entity.heardAs) {
            slotStatus +=  slotValues.entity.heardAs + ' is ';
            entity=slotValues.entity.heardAs ;
        } else {
            slotStatus += 'entity is empty. ';
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_MATCH') {
            //slotStatus += 'a valid ';
            if(slotValues.entity.resolved !== slotValues.entity.heardAs) {
               // slotStatus += 'synonym for ' + slotValues.entity.resolved + '. '; 
                } else {
            //    slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.entity.heardAs + '" to the custom slot type used by slot entity! '); 
        }

        if( (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.entity.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getResult','entity'), 'or');
        }

        say += slotStatus;
    
  
   

    const res =  getDescription(entity);
   

    
    
          say += res;
      
        return responseBuilder
            .speak(say+". Do you have more questions?")
            .reprompt('more question?')
            .getResponse();
    },
};



const getImg_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'getImg' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = '';

        let slotStatus = '';
        let resolvedSlot;
        var entity='';
        var property='';
        let slotValues = getSlotValues(request.intent.slots); 



        //   SLOT: entity 
        if (slotValues.entity.heardAs) {
            slotStatus +=  slotValues.entity.heardAs + ' is ';
            entity=slotValues.entity.heardAs ;
        } else {
            slotStatus += 'entity is empty. ';
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_MATCH') {
         //   slotStatus += 'a valid ';
            if(slotValues.entity.resolved !== slotValues.entity.heardAs) {
          //      slotStatus += 'synonym for ' + slotValues.entity.resolved + '. '; 
                } else {
             //   slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.entity.heardAs + '" to the custom slot type used by slot entity! '); 
        }

        if( (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.entity.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getResult','entity'), 'or');
        }

        say += slotStatus;

   
    var e= getEntity(entity);
    const res =  getImg(e[0]);

var response = "";
		
		const attributes = handlerInput.attributesManager.getSessionAttributes();
		if (supportsDisplay(handlerInput)) {
			const display_type = "BodyTemplate7"
			const image_url = res;
			response = getDisplay(handlerInput.responseBuilder, attributes, image_url, display_type)

        return response
			.speak('this is a '+entity+". Do you have more questions?")
            .reprompt('more question?')
			.getResponse();

		}
		else{
			response = handlerInput.responseBuilder


        return response
			.speak('you don\'t have a device that displays images. Do you have more questions?')
			.reprompt('more question?')
			.getResponse();
		}
      //var buil= new Alexa.templateBuilder.BodyTemplate2Builder();
    
         
   
    },
};




const getSuperlative_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'getSuperlative' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'The ';

        let slotStatus = '';
        let resolvedSlot;
        var entity='';
        var property='';
        var superlative='';
        let slotValues = getSlotValues(request.intent.slots); 
    
        //   SLOT: superlative 
        if (slotValues.superlative.heardAs) {
            
            slotStatus += slotValues.superlative.heardAs+" ";
            superlative=slotValues.superlative.heardAs ;
        } else {
            slotStatus += 'superlative empty ';
        }
        if (slotValues.superlative.ERstatus === 'ER_SUCCESS_MATCH') {
            //slotStatus += 'a valid ';
            if(slotValues.superlative.resolved !== slotValues.superlative.heardAs) {
               // slotStatus += 'synonym for ' + slotValues.superlative.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.superlative.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.superlative.heardAs + '" to the custom slot type used by slot stato! '); 
        }

        if( (slotValues.superlative.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.superlative.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getResult','superlative'), 'or');
        }

       
//   SLOT: property 
        if (slotValues.property.heardAs) {
            
            slotStatus += slotValues.property.heardAs+" ";
            property=slotValues.property.heardAs ;
        } else {
            slotStatus += 'property empty ';
        }
        if (slotValues.property.ERstatus === 'ER_SUCCESS_MATCH') {
            //slotStatus += 'a valid ';
            if(slotValues.property.resolved !== slotValues.property.heardAs) {
              //  slotStatus += 'synonym for ' + slotValues.property.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.property.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.property.heardAs + '" to the custom slot type used by slot stato! '); 
        }

        if( (slotValues.property.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.property.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getResult','property'), 'or');
        }

       
        //   SLOT: entity 
        if (slotValues.entity.heardAs) {
            slotStatus += 'of ' + slotValues.entity.heardAs + ' ';
            entity=slotValues.entity.heardAs ;
        } else {
            slotStatus += 'entity is empty. ';
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_MATCH') {
          //  slotStatus += 'a valid ';
            if(slotValues.entity.resolved !== slotValues.entity.heardAs) {
            //    slotStatus += 'synonym for ' + slotValues.entity.resolved + '. '; 
                } else {
                //slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.entity.heardAs + '" to the custom slot type used by slot entity! '); 
        }

        if( (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.entity.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getResult','entity'), 'or');
        }

        say += slotStatus;
    
    var p=getProperty(property);
   

    var ide=getEntity(entity);
   

    const res =  getSuperlativeQuery(ide,p,superlative);
    
          say += res;
      
        return responseBuilder
               .speak(say+". Do you have more questions?")
            .reprompt('more question?')
            .getResponse();
    },
};

const getSuperlativeFilter_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'getSuperlativeFilter' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'The ';

        let slotStatus = '';
        let resolvedSlot;
        var entity='';
        var property='';
        var superlative='';
        var filter='';
        let slotValues = getSlotValues(request.intent.slots); 
    
        //   SLOT: superlative 
        if (slotValues.superlative.heardAs) {
            
            slotStatus += slotValues.superlative.heardAs+" ";
            superlative=slotValues.superlative.heardAs ;
        } else {
            slotStatus += 'superlative empty ';
        }
        if (slotValues.superlative.ERstatus === 'ER_SUCCESS_MATCH') {
            //slotStatus += 'a valid ';
            if(slotValues.superlative.resolved !== slotValues.superlative.heardAs) {
           //     slotStatus += 'synonym for ' + slotValues.superlative.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.superlative.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.superlative.heardAs + '" to the custom slot type used by slot stato! '); 
        }

        if( (slotValues.superlative.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.superlative.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getResult','superlative'), 'or');
        }

       
//   SLOT: property 
        if (slotValues.property.heardAs) {
            
            slotStatus += slotValues.property.heardAs+" ";
            property=slotValues.property.heardAs ;
        } else {
            slotStatus += 'property empty ';
        }
        if (slotValues.property.ERstatus === 'ER_SUCCESS_MATCH') {
            //slotStatus += 'a valid ';
            if(slotValues.property.resolved !== slotValues.property.heardAs) {
          //      slotStatus += 'synonym for ' + slotValues.property.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.property.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.property.heardAs + '" to the custom slot type used by slot stato! '); 
        }

        if( (slotValues.property.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.property.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getResult','property'), 'or');
        }

       
        //   SLOT: entity 
        if (slotValues.entity.heardAs) {
            slotStatus += 'of ' + slotValues.entity.heardAs + ' in ';
            entity=slotValues.entity.heardAs ;
        } else {
            slotStatus += 'entity is empty. ';
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_MATCH') {
           // slotStatus += 'a valid ';
            if(slotValues.entity.resolved !== slotValues.entity.heardAs) {
             //   slotStatus += 'synonym for ' + slotValues.entity.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.entity.heardAs + '" to the custom slot type used by slot entity! '); 
        }

        if( (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.entity.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getResult','entity'), 'or');
        }



  //   SLOT: filter
        if (slotValues.filter.heardAs) {
            slotStatus +=slotValues.filter.heardAs + '  ';
            filter=slotValues.filter.heardAs ;
        } else {
            slotStatus += 'filter is empty. ';
        }
        if (slotValues.filter.ERstatus === 'ER_SUCCESS_MATCH') {
         //   slotStatus += 'a valid ';
            if(slotValues.filter.resolved !== slotValues.filter.heardAs) {
            //    slotStatus += 'synonym for ' + slotValues.filter.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.filter.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.filter.heardAs + '" to the custom slot type used by slot filter! '); 
        }

        if( (slotValues.filter.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.filter.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getQuantity','filter'), 'or');
        }


        say += slotStatus;
    
    var p=getProperty(property);
   

    var ide=getEntity(entity);
   
    var f=getEntity(filter);

    const res =  getSuperlativeFilter(ide,p,superlative,f);
    
          say += res;
      
        return responseBuilder
            .speak(say+". Do you have more questions?")
            .reprompt('more question?')
            .getResponse();
    },
};


const getLocation_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'getLocation' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'The ';

        let slotStatus = '';
        let resolvedSlot;
        var entity='';
        var property='';
        let slotValues = getSlotValues(request.intent.slots); 



        //   SLOT: entity 
        if (slotValues.entity.heardAs) {
            slotStatus +=  slotValues.entity.heardAs + ' ';
            entity=slotValues.entity.heardAs ;
        } else {
            slotStatus += 'entity is empty. ';
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_MATCH') {
           // slotStatus += 'a valid ';
            if(slotValues.entity.resolved !== slotValues.entity.heardAs) {
          //      slotStatus += 'synonym for ' + slotValues.entity.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.entity.heardAs + '" to the custom slot type used by slot entity! '); 
        }

        if( (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.entity.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getResult','entity'), 'or');
        }

        say += slotStatus;
    
  
    var ide=getEntity(entity);
    const res =  getLocation(ide);
   

    
    
          say += res;
      
        return responseBuilder
                .speak(say+". Do you have more questions?")
            .reprompt('more question?')
            .getResponse();
    },
};

const getResultFilter_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'getResultFilter' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'The ';

        let slotStatus = '';
        let resolvedSlot;
        var entity='';
        var property='';
        var filter='';
        let slotValues = getSlotValues(request.intent.slots); 
    

        //   SLOT: entity 
        if (slotValues.entity.heardAs) {
            slotStatus +=slotValues.entity.heardAs + ' with ';
            entity=slotValues.entity.heardAs ;
        } else {
            slotStatus += 'entity is empty. ';
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_MATCH') {
          //  slotStatus += 'a valid ';
            if(slotValues.entity.resolved !== slotValues.entity.heardAs) {
           //     slotStatus += 'synonym for ' + slotValues.entity.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding ' + slotValues.entity.heardAs + ' to the custom slot type used by slot entity! '); 
        }

        if( (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.entity.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getResult','entity'), 'or');
        }



  //   SLOT: property 
        if (slotValues.property.heardAs) {
            slotStatus += slotValues.property.heardAs + ' by ';
            property=slotValues.property.heardAs ;
        } else {
            slotStatus += 'property is empty. ';
        }
        if (slotValues.property.ERstatus === 'ER_SUCCESS_MATCH') {
         //   slotStatus += 'a valid ';
            if(slotValues.property.resolved !== slotValues.property.heardAs) {
             //   slotStatus += 'synonym for ' + slotValues.property.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.property.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.property.heardAs + '" to the custom slot type used by slot property! '); 
        }

        if( (slotValues.property.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.property.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getQuantity','property'), 'or');
        }

  //   SLOT: filter
        if (slotValues.filter.heardAs) {
            slotStatus +=slotValues.filter.heardAs + '  ';
            filter=slotValues.filter.heardAs ;
        } else {
            slotStatus += 'filter is empty. ';
        }
        if (slotValues.filter.ERstatus === 'ER_SUCCESS_MATCH') {
        //    slotStatus += 'a valid ';
            if(slotValues.filter.resolved !== slotValues.filter.heardAs) {
              //  slotStatus += 'synonym for ' + slotValues.filter.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.filter.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.filter.heardAs + '" to the custom slot type used by slot filter! '); 
        }

        if( (slotValues.filter.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.filter.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getQuantity','filter'), 'or');
        }

        say += slotStatus;
    
    

  var a=getEntity(entity);
  var p= getProperty(property);
  var b= getEntity(filter);


const res =  getResultFilter(a,p,b);
      

        say += res;
      
        return responseBuilder
          .speak(say+". Do you have more questions?")
            .reprompt('more question?')
            .getResponse();
    },
};


const getNumericFilter_Handler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'getNumericFilter' ;
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'The ';

        let slotStatus = '';
        let resolvedSlot;
        var entity='';
        var property='';
        var propertyTwo='';
        var symbol='';
        var value='';
        let slotValues = getSlotValues(request.intent.slots); 
   
        //   SLOT: property 
        if (slotValues.property.heardAs) {
            
            slotStatus += slotValues.property.heardAs+" ";
            property=slotValues.property.heardAs ;
        } else {
            slotStatus += 'property empty ';
        }
        if (slotValues.property.ERstatus === 'ER_SUCCESS_MATCH') {
            //slotStatus += 'a valid ';
            if(slotValues.property.resolved !== slotValues.property.heardAs) {
             //   slotStatus += 'synonym for ' + slotValues.property.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.property.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.property.heardAs + '" to the custom slot type used by slot stato! '); 
        }

        if( (slotValues.property.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.property.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getResultReverse','property'), 'or');
        }

       


        //   SLOT: entity 
        if (slotValues.entity.heardAs) {
            slotStatus += 'of ' + slotValues.entity.heardAs + ' ';
            entity=slotValues.entity.heardAs ;
        } else {
            slotStatus += 'entity is empty. ';
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_MATCH') {
           // slotStatus += 'a valid ';
            if(slotValues.entity.resolved !== slotValues.entity.heardAs) {
             //   slotStatus += 'synonym for ' + slotValues.entity.resolved + '. '; 
                } else {
               // slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.entity.heardAs + '" to the custom slot type used by slot entity! '); 
        }

        if( (slotValues.entity.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.entity.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getResultReverse','entity'), 'or');
        }
   //   SLOT: property2
        if (slotValues.propertyTwo.heardAs) {
            
            slotStatus += slotValues.propertyTwo.heardAs+" ";
            propertyTwo=slotValues.propertyTwo.heardAs ;
        } else {
            slotStatus += 'propertyTwo empty ';
        }
        if (slotValues.propertyTwo.ERstatus === 'ER_SUCCESS_MATCH') {
            //slotStatus += 'a valid ';
            if(slotValues.propertyTwo.resolved !== slotValues.propertyTwo.heardAs) {
               // slotStatus += 'synonym for ' + slotValues.propertyTwo.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.propertyTwo.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.propertyTwo.heardAs + '" to the custom slot type used by slot stato! '); 
        }

        if( (slotValues.propertyTwo.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.propertyTwo.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getNumericFilter','propertyTwo'), 'or');
        }
        //   SLOT: symbol
        if (slotValues.symbol.heardAs) {
            
            slotStatus += slotValues.symbol.heardAs+" ";
            symbol=slotValues.symbol.heardAs ;
        } else {
            slotStatus += 'symbol empty ';
        }
        if (slotValues.symbol.ERstatus === 'ER_SUCCESS_MATCH') {
            //slotStatus += 'a valid ';
            if(slotValues.symbol.resolved !== slotValues.symbol.heardAs) {
                //slotStatus += 'synonym for ' + slotValues.symbol.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.symbol.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.symbol.heardAs + '" to the custom slot type used by slot stato! '); 
        }

        if( (slotValues.symbol.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.symbol.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getNumericFilter','symbol'), 'or');
        }

            //   SLOT: value
        if (slotValues.value.heardAs) {
            
            slotStatus += slotValues.value.heardAs+" ";
            value=slotValues.value.heardAs ;
        } else {
            slotStatus += 'value empty ';
        }
        if (slotValues.symbol.ERstatus === 'ER_SUCCESS_MATCH') {
            //slotStatus += 'a valid ';
            if(slotValues.value.resolved !== slotValues.value.heardAs) {
             //   slotStatus += 'synonym for ' + slotValues.value.resolved + '. '; 
                } else {
              //  slotStatus += 'match. '
            } // else {
                //
        }
        if (slotValues.value.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.value.heardAs + '" to the custom slot type used by slot stato! '); 
        }

        if( (slotValues.value.ERstatus === 'ER_SUCCESS_NO_MATCH') ||  (!slotValues.symbol.heardAs) ) {
            slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('getNumericFilter','value'), 'or');
        }


        say += slotStatus;
    
        var p=getProperty(property);
   

        var ide= getEntity(entity);

           var p2=getProperty(propertyTwo);
   
        const res =  getNumericFilter(ide,p,p2,symbol,value);
    
          say += res;
  
        return responseBuilder
            .speak(say+". Do you have more questions?")
            .reprompt('more question?')
            .getResponse();
    },
};

const SessionEndedHandler =  {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder
		.speak('bye bye')
        .getResponse();
    }
};

const ErrorHandler =  {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const request = handlerInput.requestEnvelope.request;

        console.log(`Error handled: ${error.message}`);
        // console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);

        return handlerInput.responseBuilder
            .speak('sorry I don\'t know the answer, ask me something else.')
            .reprompt('sorry I don\'t know the answer, ask me something else.')
            .getResponse();
    }
};



const APP_ID = undefined;  // TODO replace with your Skill ID (OPTIONAL).

// 2.  Helper Functions ===================================================================
function getDisplay(response, attributes, image_url, display_type){
	const image = new Alexa.ImageHelper().addImageInstance(image_url).getImage();
	const current_score = attributes.correctCount;
	let display_score = ""
	console.log("the display type is => " + display_type);

	if (typeof attributes.correctCount !== 'undefined'){
		display_score = "Score: " + current_score;
	}
	else{
		display_score = "Score: 0. Let's get started!";
	}

	const myTextContent = new Alexa.RichTextContentHelper()
	.withPrimaryText('Question #' + (attributes.counter + 1) + "<br/>")
	.withSecondaryText(attributes.lastResult)
	.withTertiaryText("<br/> <font size='4'>" + display_score + "</font>")
	.getTextContent();
	
	if (display_type == "BodyTemplate7"){
		//use background image
		response.addRenderTemplateDirective({
			type: display_type,
			backButton: 'visible',
			backgroundImage: image,
			title:"",
			textContent: myTextContent,
			});	
	}
	else{
		response.addRenderTemplateDirective({
			//use 340x340 image on the right with text on the left.
			type: display_type,
			backButton: 'visible',
			image: image,
			title:"",
			textContent: myTextContent,
			});	
	}
	
	return response
}

function getProperty(property){
  var ide = getEntity(property);
   
 for(var i=0;i<ide.length;i++){
 


var sparql="SELECT ?id WHERE { wd:"+ide[i]+" wdt:P1687 ?id SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }} ORDER BY ASC(?item)";

const url = wbk.sparqlQuery(sparql);

var request = require('sync-request');
var res = request('GET', url, {
  headers: {
    'user-agent': 'example-user-agent',
  },
});

 var b= JSON.parse(res.getBody());

  var count = Object.keys(b.results.bindings).length;

 if(count>0){

 var c=b.results.bindings[0].id.value;
 var a= getCode(c);

 return a;


}
   
     }


}


function getCode(code){
    var x='';

    var i;  
    for(i= (code.length-1);i>=0;i--){
        if(code.charAt(i)=='/'){
                    break;
            }
            x=code.charAt(i)+x

            

    }
    return x;
}



function getEntity(s){

var array=[];
const  search  =  s;
const language = 'en'; // will default to 'en'
const limit = 7; // defaults to 20
const format = 'json' ;// defaults to json

const urlNaz = wbk.searchEntities(search, language, limit, format);
var ids='';

var res = request('GET', urlNaz);
 var b= JSON.parse(res.getBody());

 var count = Object.keys(b.search).length;


 for(var i=0;i<count;i++){
 
 array.push(b.search[i].id);

  }
return array;

}



function getResultQuery(ids,p){

var c='';


var i=0;
while(i<ids.length){

  
 var sparql="SELECT ?citta ?cittaLabel WHERE { wd:"+ids[i]+"  wdt:"+p+" ?citta; SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }}";
 const url = wbk.sparqlQuery(sparql);

var request = require('sync-request');
var res = request('GET', url, {
  headers: {
    'user-agent': 'example-user-agent',
  },
});

  var b= JSON.parse(res.getBody());

   var count = Object.keys(b.results.bindings).length;
   

    
 if(count>5){
    c+='are '+count+' results, here are the top 5: ';
    for(var f=0; f<5; f++){
    c+=b.results.bindings[f].cittaLabel.value;
     if(f!=count-1){
    c+=',';
    }
    
    }
    c= cancellaCarattereSpeciale(c);
    return c;
 }else if(count>1&& count<6){
 c+='are '+count+' results: ';
    for(var f=0; f<count; f++){
    c+=b.results.bindings[f].cittaLabel.value;
     if(f!=count-1){
    c+=',';
    
    }
    
  }
  c= cancellaCarattereSpeciale(c);
  return c;
 }else if(count==1){
    c+='is ';
   c+=b.results.bindings[0].cittaLabel.value;
   return c;
  }else if(count==0 && i==(ids.length -1)){
 c+=b.results.bindings[0].cittaLabel.value;
  }

 i++;
}

c+=b.results.bindings[0].cittaLabel.value;
c= cancellaCarattereSpeciale(c);
return c;
  
}



function getResulQueryReverse(ids,p){


var c='';


var i=0;
while(i<ids.length){

  
 var sparql="SELECT ?citta ?cittaLabel WHERE {?citta  wdt:"+p+" wd:"+ids[i]+"; SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }}";
 const url = wbk.sparqlQuery(sparql);

var request = require('sync-request');
var res = request('GET', url, {
  headers: {
    'user-agent': 'example-user-agent',
  },
});

  var b= JSON.parse(res.getBody());

   var count = Object.keys(b.results.bindings).length;
   

    
 if(count>5){
    c+='are '+count+' results, here are the top 5: ';
    for(var f=0; f<5; f++){
    c+=b.results.bindings[f].cittaLabel.value;
     if(f!=4){
    c+=',';
    }
    
    }
    c= cancellaCarattereSpeciale(c);
    return c;
 }else if(count>1&& count<6){
 c+='are '+count+' results: ';
    for(var f=0; f<count; f++){
    c+=b.results.bindings[f].cittaLabel.value;
     if(f!=count-1){
    c+=',';
    
    }
    
  }
  c= cancellaCarattereSpeciale(c);
  return c;
 }else if(count==1){
    c+='is ';
   c+=b.results.bindings[0].cittaLabel.value;
   c= cancellaCarattereSpeciale(c);
   return c;
  }else if(count==0 && i==(ids.length -1)){


 c+=b.results.bindings[0].cittaLabel.value;
  }

 i++;
}

c+=b.results.bindings[0].cittaLabel.value;
c= cancellaCarattereSpeciale(c);
return c;

}

function getSuperlativeQuery(ids,p,superlativo){

let ord='';
if(superlativo=='least'){
ord='ASC'
}else if(superlativo=='most'){
ord='DESC'
}



for(var i=0;i<ids.length;i++){


   
 var sparql="SELECT ?citta ?cittaLabel  ?res WHERE{VALUES ?a {wd:"+ids[i]+"} VALUES ?p {wdt:"+p+"}  ?citta wdt:P31 ?a. ?citta ?p ?res. SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\" }}ORDER BY "+ord+"(?res) LIMIT 1";
 const url = wbk.sparqlQuery(sparql);

var request = require('sync-request');
var res = request('GET', url, {
  headers: {
    'user-agent': 'example-user-agent',
  },
});

  var b= JSON.parse(res.getBody());

   var count = Object.keys(b.results.bindings).length;
   
if(count>0){

 var c='is '+b.results.bindings[0].cittaLabel.value;
 c= cancellaCarattereSpeciale(c);
  return c;

}

}
var c='is '+b.results.bindings[0].cittaLabel.value;
c= cancellaCarattereSpeciale(c);
  return c;


}


function getResultFilter(ids,p,filter){

var c='';


var i=0;
while(i<ids.length){

  
 var sparql="SELECT ?result ?resultLabel WHERE { ?result  wdt:P31 wd:"+ids[i]+";wdt:"+p+" wd:"+filter[0]+". SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }}";
 
 const url = wbk.sparqlQuery(sparql);

var request = require('sync-request');
var res = request('GET', url, {
  headers: {
    'user-agent': 'example-user-agent',
  },
});

  var b= JSON.parse(res.getBody());

   var count = Object.keys(b.results.bindings).length;
   

    
 if(count>5){
    c+='are '+count+' results, here are the top 5: ';
    for(var f=0; f<5; f++){
    c+=b.results.bindings[f].resultLabel.value;
     if(f!=4){
    c+=',';
    }
    
    }
    c= cancellaCarattereSpeciale(c);
    return c;
 }else if(count>1&& count<6){
 c+='are '+count+' results: ';
    for(var f=0; f<count; f++){
    c+=b.results.bindings[f].resultLabel.value;
     if(f!=count-1){
    c+=',';
    
    }
    
  }
   c= cancellaCarattereSpeciale(c);
  return c;
 }else if(count==1){
    c+='is ';
   c+=b.results.bindings[0].resultLabel.value;
    c= cancellaCarattereSpeciale(c);
   return c;
  }else if(count==0 && i==(ids.length -1)){
 c+=b.results.bindings[0].resultLabel.value;
  }

 i++;
}
}

function cancellaCarattereSpeciale(output){
	var miaStringaReplace='';
	if(output.indexOf("&")||output.indexOf("-")||output.indexOf("_")||output.indexOf("/")||output.indexOf("\""))
	{
	 	miaStringaReplace = output.replace("-", " ");
	 	miaStringaReplace = output.replace("_", " ");
	  	miaStringaReplace = output.replace("/", " ");
	   	miaStringaReplace = output.replace("\"", " ");
	   	miaStringaReplace = output.replace("&", " and ");
		return miaStringaReplace;
	}else{
		return output;
	}

}


/*
function getResultFilterReverse(ids,p,filter){
for(var i=0;i<ids.length;i++){

 var sparql="SELECT ?result ?resultLabel WHERE { ?result  wdt:P31 wd:"+ids[i]+".wd:"+filter[0]+" wdt:"+p+" ?result.  SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }}";
 const url = wbk.sparqlQuery(sparql);

var request = require('sync-request');
var res = request('GET', url, {
  headers: {
    'user-agent': 'example-user-agent',
  },
});

  var b= JSON.parse(res.getBody());

   var count = Object.keys(b.results.bindings).length;
 

    
 if(count>5){
    c+='are '+count+' results, here are the top 5: ';
    for(var f=0; f<5; f++){
    c+=b.results.bindings[f].resultLabel.value;
     if(f!=4){
    c+=',';
    }
    
    }
    return c;
 }else if(count>1&& count<6){
 c+='are '+count+' results: ';
    for(var f=0; f<count; f++){
    c+=b.results.bindings[f].resultLabel.value;
     if(f!=count-2){
    c+=',';
    
    }
    
  }
  return c;
 }else if(count==1){
    c+='is ';
   c+=b.results.bindings[0].resultLabel.value;
   return c;
  }else if(count==0 && i==(ids.length -1)){
 c+=b.results.bindings[0].resultLabel.value;
  }

 i++;
}
}
*/

 function getImg(ids){

var c='';
var sparql='';

sparql+= "SELECT ?img ?imgLabel WHERE { wd:"+ids+" wdt:P18 ?img;  SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }}";

 const url = wbk.sparqlQuery(sparql);

var request = require('sync-request');
var res = request('GET', url, {
  headers: {
    'user-agent': 'example-user-agent',
  },
});

  var b= JSON.parse(res.getBody());

   var count = Object.keys(b.results.bindings).length;
  

 if(count>=1){
   
   c= b.results.bindings[0].imgLabel.value;
  return c;
 
    }else{
    c=b.results.bindings[0].count.value;
     return c;
     }

}


function getDescription(s){

const  search  =  s;
const language = 'en'; // will default to 'en'
const limit = 10; // defaults to 20
const format = 'json' ;// defaults to json

const urlNaz = wbk.searchEntities(search, language, limit, format);
var ids='';

var res = request('GET', urlNaz);
 var b= JSON.parse(res.getBody());
       ids=b.search[0].description;
       ids= cancellaCarattereSpeciale(ids);

return ids;
}


function getLocation(ids){

var c='';



for(var i=0;i<ids.length;i++){

  
 var sparql="SELECT ?citta ?cittaLabel ?loc ?locLabel WHERE { VALUES ?loc {wdt:P276 wdt:P6375 wdt:P131 wdt:P17} wd:"+ids[i]+" ?loc ?citta; SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }} ORDER BY DESC(?citta)";
 const url = wbk.sparqlQuery(sparql);

var request = require('sync-request');
var res = request('GET', url, {
  headers: {
    'user-agent': 'example-user-agent',
  },
});

  var b= JSON.parse(res.getBody());

   var count = Object.keys(b.results.bindings).length;
   

 if(count>1){
 c='is in:';
    for(var f=0; f<count; f++){
    c+=' '+b.results.bindings[f].cittaLabel.value;
    if(f!=count-1){
    c+=',';
    }
    
  }
  c= cancellaCarattereSpeciale(c);
  return c;
 }else if(count==1){
    c='is in ';
   c+=b.results.bindings[0].cittaLabel.value;
   c= cancellaCarattereSpeciale(c);
  return c;
   //else if(count==0){} vedremo
     }else if(count==0 && i==(ids.length -1)){
         c=b.results.bindings[0].cittaLabel.value;

     }
    //return c;
  }

c=b.results.bindings[0].cittaLabel.value;

}




function getSuperlativeFilter(ids,p,superlativo,filter){

let ord='';
if(superlativo=='least'){
ord='ASC'
}else if(superlativo=='most'){
ord='DESC'
}



for(var i=0;i<ids.length;i++){


  //cambia query
 var sparql="SELECT ?citta ?cittaLabel  ?res WHERE{ VALUES ?a {wd:"+ids[i]+"} VALUES ?p {wdt:"+p+"} ?citta wdt:P31 ?a.  ?citta wdt:P17 wd:"+filter[0]+". ?citta ?p ?res. SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\" } }ORDER BY "+ord+"(?res) LIMIT 1";
 const url = wbk.sparqlQuery(sparql);

var request = require('sync-request');
var res = request('GET', url, {
  headers: {
    'user-agent': 'example-user-agent',
  },
});

  var b= JSON.parse(res.getBody());

   var count = Object.keys(b.results.bindings).length;
   
if(count>0){

 var c='is '+b.results.bindings[0].cittaLabel.value;
 c= cancellaCarattereSpeciale(c);
  return c;

}

}
var c='is '+b.results.bindings[0].cittaLabel.value;
c= cancellaCarattereSpeciale(c);
  return c;


}


function getNumericFilter(ids,p,p2,simbolo,value){
if(simbolo=='more'){
    simbolo='>';
}else if(simbolo=='less'){
   simbolo='<';
}else if(simbolo=='equal'){
   simbolo='=';
}
var c='';


var i=0;
while(i<ids.length){

 var sparql="SELECT DISTINCT ?result ?resultLabel WHERE { ?result wdt:"+p+" wd:"+ids[i]+".  ?result wdt:"+p2+" ?value .   FILTER(?value "+simbolo+value+" )  SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\" }}";
 const url = wbk.sparqlQuery(sparql);

var request = require('sync-request');
var res = request('GET', url, {
  headers: {
    'user-agent': 'example-user-agent',
  },
});

  var b= JSON.parse(res.getBody());

   var count = Object.keys(b.results.bindings).length;
   

    
 if(count>5){
    c+='are '+count+' results, here are the top 5: ';
    for(var f=0; f<5; f++){
    c+=b.results.bindings[f].resultLabel.value;
     if(f!=4){
    c+=',';
    }
    
    }
    c= cancellaCarattereSpeciale(c);
    return c;
 }else if(count>1&& count<6){
 c+='are '+count+' results: ';
    for(var f=0; f<count; f++){
    c+=b.results.bindings[f].resultLabel.value;
     if(f!=count-2){
    c+=',';
    
    }
    
  }
  c= cancellaCarattereSpeciale(c);
  return c;
 }else if(count==1){
    c+='is ';
   c+=b.results.bindings[0].resultLabel.value;
   return c;
  }else if(count==0 && i==(ids.length -1)){
 c+=getNumericFilter2(ids,p,p2,simbolo,value); 
 c= cancellaCarattereSpeciale(c);
 return c;
  }

 i++;
}
}


function getNumericFilter2(ids,p,p2,simbolo,value){
if(simbolo=='more'){
    simbolo='>';
}else if(simbolo=='less'){
   simbolo='<';
}else if(simbolo=='equal'){
   simbolo='=';
}
var c='';


var i=0;
while(i<ids.length){


 var sparql="SELECT DISTINCT ?result ?resultLabel WHERE { ?result wdt:"+p+" wd:"+ids[i]+".  ?result wdt:"+p2+" ?value .   FILTER(year(?value) "+simbolo+value+" )  SERVICE wikibase:label { bd:serviceParam wikibase:language \"en\" }}";
 const url = wbk.sparqlQuery(sparql);

var request = require('sync-request');
var res = request('GET', url, {
  headers: {
    'user-agent': 'example-user-agent',
  },
});

  var b= JSON.parse(res.getBody());

   var count = Object.keys(b.results.bindings).length;
   

    
 if(count>5){
    c+='are '+count+' results, here are the top 5: ';
    for(var f=0; f<5; f++){
    c+=b.results.bindings[f].resultLabel.value;
     if(f!=4){
    c+=',';
    }
    
    }
    c= cancellaCarattereSpeciale(c);
    return c;
 }else if(count>1&& count<6){
 c+='are '+count+' results: ';
    for(var f=0; f<count; f++){
    c+=b.results.bindings[f].resultLabel.value;
     if(f!=count-2){
    c+=',';
    
    }
    
  }
  return c;
 }else if(count==1){
    c+='is ';
   c+=b.results.bindings[0].resultLabel.value;
   c= cancellaCarattereSpeciale(c);
   return c;
  }else if(count==0 && i==(ids.length -1)){
 c+=b.results.bindings[0].resultLabel.value; 
  }

 i++;
}
}
function capitalize(myString) {

     return myString.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); }) ;
}

 
function randomElement(myArray) { 
    return(myArray[Math.floor(Math.random() * myArray.length)]); 
} 
 
function stripSpeak(str) { 
    return(str.replace('<speak>', '').replace('</speak>', '')); 
} 
 
 
 
 
function getSlotValues(filledSlots) { 
    const slotValues = {}; 
 
    Object.keys(filledSlots).forEach((item) => { 
        const name  = filledSlots[item].name; 
 
        if (filledSlots[item] && 
            filledSlots[item].resolutions && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0] && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status && 
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) { 
            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) { 
                case 'ER_SUCCESS_MATCH': 
                    slotValues[name] = { 
                        heardAs: filledSlots[item].value, 
                        resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name, 
                        ERstatus: 'ER_SUCCESS_MATCH' 
                    }; 
                    break; 
                case 'ER_SUCCESS_NO_MATCH': 
                    slotValues[name] = { 
                        heardAs: filledSlots[item].value, 
                        resolved: '', 
                        ERstatus: 'ER_SUCCESS_NO_MATCH' 
                    }; 
                    break; 
                default: 
                    break; 
            } 
        } else { 
            slotValues[name] = { 
                heardAs: filledSlots[item].value, 
                resolved: '', 
                ERstatus: '' 
            }; 
        } 
    }, this); 
 
    return slotValues; 
} 
 
function getExampleSlotValues(intentName, slotName) { 
 
    let examples = []; 
    let slotType = ''; 
    let slotValuesFull = []; 
 
    let intents = model.interactionModel.languageModel.intents; 
    for (let i = 0; i < intents.length; i++) { 
        if (intents[i].name == intentName) { 
            let slots = intents[i].slots; 
            for (let j = 0; j < slots.length; j++) { 
                if (slots[j].name === slotName) { 
                    slotType = slots[j].type; 
 
                } 
            } 
        } 
         
    } 
    let types = model.interactionModel.languageModel.types; 
    for (let i = 0; i < types.length; i++) { 
        if (types[i].name === slotType) { 
            slotValuesFull = types[i].values; 
        } 
    } 
 
 
    examples.push(slotValuesFull[0].name.value); 
    examples.push(slotValuesFull[1].name.value); 
    if (slotValuesFull.length > 2) { 
        examples.push(slotValuesFull[2].name.value); 
    } 
 
 
    return examples; 
} 
 
function sayArray(myData, penultimateWord = 'and') { 
    let result = ''; 
 
    myData.forEach(function(element, index, arr) { 
 
        if (index === 0) { 
            result = element; 
        } else if (index === myData.length - 1) { 
            result += ` ${penultimateWord} ${element}`; 
        } else { 
            result += `, ${element}`; 
        } 
    }); 
    return result; 
} 
function supportsDisplay(handlerInput) // returns true if the skill is running on a device with a display (Echo Show, Echo Spot, etc.) 
{                                      //  Enable your skill for display as shown here: https://alexa.design/enabledisplay 
    const hasDisplay = 
        handlerInput.requestEnvelope.context && 
        handlerInput.requestEnvelope.context.System && 
        handlerInput.requestEnvelope.context.System.device && 
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces && 
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display; 
 
    return hasDisplay; 
} 
 
 
const welcomeCardImg = { 
    smallImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane720_480.png", 
    largeImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane1200_800.png" 
 
 
}; 
 
const DisplayImg1 = { 
    title: 'Jet Plane', 
    url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png' 
}; 
const DisplayImg2 = { 
    title: 'Starry Sky', 
    url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png' 
 
}; 
 
function getCustomIntents() { 
    const modelIntents = model.interactionModel.languageModel.intents; 
 
    let customIntents = []; 
 
 
    for (let i = 0; i < modelIntents.length; i++) { 
 
        if(modelIntents[i].name.substring(0,7) != "AMAZON." && modelIntents[i].name !== "LaunchRequest" ) { 
            customIntents.push(modelIntents[i]); 
        } 
    } 
    return customIntents; 
} 
 
function getSampleUtterance(intent) { 
 
    return randomElement(intent.samples); 
 
} 
 
function getPreviousIntent(attrs) { 
 
    if (attrs.history && attrs.history.length > 1) { 
        return attrs.history[attrs.history.length - 2].IntentRequest; 
 
    } else { 
        return false; 
    } 
 
} 
 
function getPreviousSpeechOutput(attrs) { 
 
    if (attrs.lastSpeechOutput && attrs.history.length > 1) { 
        return attrs.lastSpeechOutput; 
 
    } else { 
        return false; 
    } 
 
} 
 
function timeDelta(t1, t2) { 
 
    const dt1 = new Date(t1); 
    const dt2 = new Date(t2); 
    const timeSpanMS = dt2.getTime() - dt1.getTime(); 
    const span = { 
        "timeSpanMIN": Math.floor(timeSpanMS / (1000 * 60 )), 
        "timeSpanHR": Math.floor(timeSpanMS / (1000 * 60 * 60)), 
        "timeSpanDAY": Math.floor(timeSpanMS / (1000 * 60 * 60 * 24)), 
        "timeSpanDesc" : "" 
    }; 
 
 
    if (span.timeSpanHR < 1) { 
        span.timeSpanDesc = span.timeSpanMIN + " minutes"; 
    } else if (span.timeSpanDAY < 1) { 
        span.timeSpanDesc = span.timeSpanHR + " hours"; 
    } else { 
        span.timeSpanDesc = span.timeSpanDAY + " days"; 
    } 
 
 
    return span; 
 
} 
 
 
const InitMemoryAttributesInterceptor = { 
    process(handlerInput) { 
        let sessionAttributes = {}; 
        if(handlerInput.requestEnvelope.session['new']) { 
 
            sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
 
            let memoryAttributes = getMemoryAttributes(); 
 
            if(Object.keys(sessionAttributes).length === 0) { 
 
                Object.keys(memoryAttributes).forEach(function(key) {  // initialize all attributes from global list 
 
                    sessionAttributes[key] = memoryAttributes[key]; 
 
                }); 
 
            } 
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
 
        } 
    } 
}; 
 
const RequestHistoryInterceptor = { 
    process(handlerInput) { 
 
        const thisRequest = handlerInput.requestEnvelope.request; 
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
 
        let history = sessionAttributes['history'] || []; 
 
        let IntentRequest = {}; 
        if (thisRequest.type === 'IntentRequest' ) { 
 
            let slots = []; 
 
            IntentRequest = { 
                'IntentRequest' : thisRequest.intent.name 
            }; 
 
            if (thisRequest.intent.slots) { 
 
                for (let slot in thisRequest.intent.slots) { 
                    let slotObj = {}; 
                    slotObj[slot] = thisRequest.intent.slots[slot].value; 
                    slots.push(slotObj); 
                } 
 
                IntentRequest = { 
                    'IntentRequest' : thisRequest.intent.name, 
                    'slots' : slots 
                }; 
 
            } 
 
        } else { 
            IntentRequest = {'IntentRequest' : thisRequest.type}; 
        } 
        if(history.length > maxHistorySize - 1) { 
            history.shift(); 
        } 
        history.push(IntentRequest); 
 
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
    } 
 
}; 
 
 
 
 
const RequestPersistenceInterceptor = { 
    process(handlerInput) { 
 
        if(handlerInput.requestEnvelope.session['new']) { 
 
            return new Promise((resolve, reject) => { 
 
                handlerInput.attributesManager.getPersistentAttributes() 
 
                    .then((sessionAttributes) => { 
                        sessionAttributes = sessionAttributes || {}; 
 
 
                        sessionAttributes['launchCount'] += 1; 
 
                        handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
                        handlerInput.attributesManager.savePersistentAttributes() 
                            .then(() => { 
                                resolve(); 
                            }) 
                            .catch((err) => { 
                                reject(err); 
                            }); 
                    }); 
 
            }); 
 
        } // end session['new'] 
    } 
}; 
 
 
const ResponseRecordSpeechOutputInterceptor = { 
    process(handlerInput, responseOutput) { 
 
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
        let lastSpeechOutput = { 
            "outputSpeech":responseOutput.outputSpeech.ssml, 
            "reprompt":responseOutput.reprompt.outputSpeech.ssml 
        }; 
 
        sessionAttributes['lastSpeechOutput'] = lastSpeechOutput; 
 
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes); 
 
    } 
}; 
 
const ResponsePersistenceInterceptor = { 
    process(handlerInput, responseOutput) { 
 
        const ses = (typeof responseOutput.shouldEndSession == "undefined" ? true : responseOutput.shouldEndSession); 
 
        if(ses || handlerInput.requestEnvelope.request.type == 'SessionEndedRequest') { // skill was stopped or timed out 
 
            let sessionAttributes = handlerInput.attributesManager.getSessionAttributes(); 
 
            sessionAttributes['lastUseTimestamp'] = new Date(handlerInput.requestEnvelope.request.timestamp).getTime(); 
 
            handlerInput.attributesManager.setPersistentAttributes(sessionAttributes); 
 
            return new Promise((resolve, reject) => { 
                handlerInput.attributesManager.savePersistentAttributes() 
                    .then(() => { 
                        resolve(); 
                    }) 
                    .catch((err) => { 
                        reject(err); 
                    }); 
 
            }); 
 
        } 
 
    } 
}; 
 
 
 
// 4. Exports handler function and setup ===================================================
const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder
    .addRequestHandlers(
        AMAZON_CancelIntent_Handler, 
        AMAZON_HelpIntent_Handler, 
        AMAZON_StopIntent_Handler, 
        AMAZON_NavigateHomeIntent_Handler, 
        getResult_Handler, 
        getDescription_Handler,
        getLocation_Handler, 
        getSuperlative_Handler,
        getImg_Handler,
       // getQuantity_Handler,
        getResultFilter_Handler,
        getResultReverse_Handler,
        getSuperlativeFilter_Handler,
        getNumericFilter_Handler,
        LaunchRequest_Handler, 
        SessionEndedHandler
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(InitMemoryAttributesInterceptor)
    .addRequestInterceptors(RequestHistoryInterceptor)


    .lambda();