/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk');
const AWS = require('aws-sdk');
// Replace the text in this endpoint with your AWS IoT Thing endpoint from the Interact section.
const iotData = new AWS.IotData({ endpoint: "a2bwgh96pae15j-ats.iot.us-west-2.amazonaws.com" });

const GetNewFactHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest'
      || (request.type === 'IntentRequest'
        && request.intent.name === 'MotionStatusIntent');
  },
  handle(handlerInput) {
    const factArr = data;
    const factIndex = Math.floor(Math.random() * factArr.length);
    const randomFact = factArr[factIndex];
    var speechOutput = ALEXA_TOASTER_RESPONSE_MESSAGE;
    var activate = 3;
	
	const params = {
      topic: '$aws/things/motion/shadow/update',
      payload: '{ "state": { "desired": {"activate":4}}}'
    }
	console.log('toaster ready to publish');
	iotData.publish(params, (err, res) => {
      if (err)
        console.log(err);
      else
        console.log(res);
	
	
    });
    var paramsGet = {
        "thingName": "motion"
    };
    iotData.getThingShadow(paramsGet, function (err, data) {
        var jsonPayload = JSON.parse(data.payload);
        var activate = jsonPayload.state.desired.activate
        if (err) {
            console.log("Error : " + err, err.stack);
        } else {
            console.log(activate);
            console.log("I think it worked");
        }
    });   
    if (activate == 1){
      speechOutput = ALEXA_TOASTER_RESPONSE_MESSAGE + "Motion is activated";
    }else if (activate == 0){
      speechOutput = ALEXA_TOASTER_RESPONSE_MESSAGE + "Motion is inactive";
    }
    else{
      speechOutput = ALEXA_TOASTER_RESPONSE_MESSAGE + "Motion is unknown";
    }
    return handlerInput.responseBuilder
	.speak(speechOutput)
	.withSimpleCard(SKILL_NAME, randomFact)
	.getResponse();
  },
};

const HelpHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(HELP_MESSAGE)
      .reprompt(HELP_REPROMPT)
      .getResponse();
  },
};

const ExitHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
        || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    return handlerInput.responseBuilder
      .speak(STOP_MESSAGE)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, an error occurred.')
      .reprompt('Sorry, an error occurred.')
      .getResponse();
  },
};

const SKILL_NAME = 'motion';
const ALEXA_TOASTER_RESPONSE_MESSAGE = 'Signal sent. ';
const HELP_MESSAGE = 'You can ask for status, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const data = [
  'Toast sounds good to me.',
  'I like my toast like charcoal.',
  'It should be heating up.',
  'This should be interesting.',
  'Sounds yummy.',
];

const skillBuilder = Alexa.SkillBuilders.standard();

exports.handler = skillBuilder
  .addRequestHandlers(
    GetNewFactHandler,
    HelpHandler,
    ExitHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
