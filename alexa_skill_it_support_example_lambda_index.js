/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a sample skill built with Amazon Alexa Skills nodejs
 * skill development kit.
 * This sample supports multiple languages (en-US, en-GB, de-GB).
 * The Intent Schema, Custom Slot and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-howto
 **/

'use strict';

const Alexa = require('alexa-sdk');
const awsSDK = require('aws-sdk');

const docClient = new awsSDK.DynamoDB.DocumentClient();

const APP_ID = undefined; // TODO replace with your app ID (OPTIONAL).

const DbTable = 'IT_SUPPORT_TABLE_2'; // change this to the name of your dynamoDB table

const languageStrings = {
    'en': {
        translation: {
            SKILL_NAME: 'IT Support Checklist',
            WELCOME_MESSAGE: "Welcome to %s. You can say things like, I need help with a technical problem... Now, what can I help you with?",
            WELCOME_REPROMPT: 'For instructions on what you can say, please say help me.',
            DISPLAY_CARD_TITLE: '%s  - Recipe for %s.',
            HELP_MESSAGE: "You can ask questions such as, how do I fix my stupid computer...Now, what can I help you with?",
            HELP_REPROMPT: "You can say things like, My computer is broken, or you can say exit...Now, what can I help you with?",
            STOP_MESSAGE: 'Goodbye!',
            CHECKLIST_ITEM_1: "please describe your problem in one sentence starting with the phrase: My problem is.",
            CHECKLIST_ITEM_2: 'have you tried turning your computer off and on again?',
            CHECKLIST_ITEM_3 : 'have you checked that the power cable is plugged into a socket?',
            CHECKLIST_ITEM_4 : 'have you checked that the power socket is switched on?',
            CHECKLIST_ITEM_5 : 'Are you using Windows?',
            CHECKLIST_ITEM_5a: 'Well that is your problem then',
            CHECKLIST_ITEM_6 : 'You do know the difference between a CD drive and a coffee holder, right?',
            CHECKLIST_ITEM_7 : "Sometimes it really seems like computers have a mind of their own, doesn't it?... I'm sorry I wasn't more helpful."
        },
    },
};

const handlers = {
    //Use LaunchRequest, instead of NewSession if you want to use the one-shot model
    // Alexa, ask [my-skill-invocation-name] to (do something)...
    'LaunchRequest': function () {
        this.attributes.speechOutput = this.t('WELCOME_MESSAGE', this.t('SKILL_NAME'));
        // If the user either does not reply to the welcome message or says something that is not
        // understood, they will be prompted again with this text.
        this.attributes.repromptSpeech = this.t('WELCOME_REPROMPT');

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'BeginChecklistIntent': function () {
        console.log("Hello World");
        //console.log(JSON.stringify(this.event.session)); // uncomment this to view the session data
        
        //save the session details
        const { userId } = this.event.session.user;
        const { sessionId } = this.event.session;
        const checklist_item_number = 1;
        const timestamp = new Date().getTime();
        
        const DB_put_params = {
            TableName: DbTable,
            Item: {
                userId: userId,
                sessionId: sessionId,
                ChecklistItemNumber: checklist_item_number,
                CreationTimestamp: timestamp
            }
        };
        
        docClient.put(DB_put_params, function (err, data) {
            if (err) {
                console.error("Unable to put item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log(JSON.stringify(data, null, 2));
            }
        });

        this.attributes.speechOutput = this.t('CHECKLIST_ITEM_1');
        this.attributes.repromptSpeech = this.t('CHECKLIST_ITEM_1');
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AnswerIntent': function () {
        const { userId } = this.event.session.user;
        const { sessionId } = this.event.session;
        
        const responseSlot = this.event.request.intent.slots.Response.value;
        
        //make this available in callbacks
        const this_object = this;
        
        const error_response = "An error has occurred..." + this.t('CHECKLIST_ITEM_1');
        const item_2_response = this.t('CHECKLIST_ITEM_2');
        
        //retreive the session data
        const DB_check_params = {
            TableName: DbTable,
            Key: {
                userId: userId,
                sessionId: sessionId
            }
        };
        
        docClient.get(DB_check_params, function(err, data) {
            if (err) {
                console.error("Unable to retreive item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log(JSON.stringify(data));
                const my_item = data["Item"];
                console.log(my_item);
                
                //check that we are answering the correct question
                if (my_item["ChecklistItemNumber"] != 1) { 
                    console.log("oops something has happened");  
                    
                    this_object.attributes.speechOutput = error_response;
                    this_object.attributes.repromptSpeech = error_response;
                    this_object.response.speak(this_object.attributes.speechOutput).listen(this_object.attributes.repromptSpeech);
                    this_object.emit(':responseReady');
                } else {
                    my_item["ChecklistItem1"] = responseSlot;
                    my_item["ChecklistItemNumber"] += 1;
                    const DB_put_params = {
                        TableName: DbTable,
                        Item: my_item
                    };
                    
                    docClient.put(DB_put_params, function (err, data) {
                        if (err) {
                            console.error("Unable to put item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("data saved");
                            this_object.attributes.speechOutput = item_2_response;
                            this_object.attributes.repromptSpeech = item_2_response;
                            this_object.response.speak(this_object.attributes.speechOutput).listen(this_object.attributes.repromptSpeech);
                            this_object.emit(':responseReady');
                        }
                    });
                }
            }
        });
    },
    'AMAZON.YesIntent': function () {
        const { userId } = this.event.session.user;
        const { sessionId } = this.event.session;
        var item_code = "CHECKLIST_ITEM_";
        var new_item_code = "CHECKLIST_ITEM_";
        
        //make this available in callbacks
        const this_object = this;
        
        //retreive the session data
        const DB_check_params = {
            TableName: DbTable,
            Key: {
                userId: userId,
                sessionId: sessionId
            }
        };
        docClient.get(DB_check_params, function(err, data) {
            if (err) {
                console.error("Unable to retreive item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                
                console.log(JSON.stringify(data));
                const my_item = data["Item"];
                console.log(my_item);
                if (my_item['ChecklistItemNumber'] == 1) {
                    console.erroe('Wrong item number');
                    return;
                }
                //log answer and ask next question
                item_code += JSON.stringify(my_item['ChecklistItemNumber']);
                my_item[item_code] = 'Yes';
                new_item_code += JSON.stringify(my_item['ChecklistItemNumber'] + 1);
                //branch off for funny answer on item 5
                if (my_item['ChecklistItemNumber'] == 5) {
                    my_item['ChecklistItemNumber'] += 1;
                    const DB_put_params = {
                        TableName: DbTable,
                        Item: my_item
                    };
                    docClient.put(DB_put_params, function (err, data) {
                        if (err) {
                            console.error("Unable to put item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("data saved");
                            this_object.attributes.speechOutput = this_object.t('CHECKLIST_ITEM_5a');
                            this_object.response.speak(this_object.attributes.speechOutput);
                            this_object.emit(':responseReady');
                        }
                    });
                } else {
                    my_item['ChecklistItemNumber'] += 1;
                    const DB_put_params = {
                        TableName: DbTable,
                        Item: my_item
                    };
                    docClient.put(DB_put_params, function (err, data) {
                        if (err) {
                            console.error("Unable to put item. Error JSON:", JSON.stringify(err, null, 2));
                        } else {
                            console.log("data saved");
                            this_object.attributes.speechOutput = this_object.t(new_item_code);
                            this_object.attributes.repromptSpeech = this_object.t(new_item_code);
                            this_object.response.speak(this_object.attributes.speechOutput).listen(this_object.attributes.repromptSpeech);
                            this_object.emit(':responseReady');
                        }
                    });
                }
                
            }
        });
    },
    'AMAZON.NoIntent': function () {
        const { userId } = this.event.session.user;
        const { sessionId } = this.event.session;
        var next_item = "CHECKLIST_ITEM_";
        var new_item_code = "CHECKLIST_ITEM_";
        
        //make this available in callbacks
        const this_object = this;
        
        //retreive the session data
        const DB_check_params = {
            TableName: DbTable,
            Key: {
                userId: userId,
                sessionId: sessionId
            }
        };
        docClient.get(DB_check_params, function(err, data) {
            if (err) {
                console.error("Unable to retreive item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                
                console.log(JSON.stringify(data));
                const my_item = data["Item"];
                console.log(my_item);
                if (my_item['ChecklistItemNumber'] == 1) {
                    console.erroe('Wrong item number');
                    return;
                }
                //log answer and ask next question
                next_item += JSON.stringify(my_item['ChecklistItemNumber']);
                my_item[next_item] = 'No';
                new_item_code += JSON.stringify(my_item['ChecklistItemNumber'] + 1);
                my_item['ChecklistItemNumber'] += 1;
                
                const DB_put_params = {
                    TableName: DbTable,
                    Item: my_item
                };
                docClient.put(DB_put_params, function (err, data) {
                    if (err) {
                        console.error("Unable to put item. Error JSON:", JSON.stringify(err, null, 2));
                    } else {
                        console.log("data saved");
                        this_object.attributes.speechOutput = this_object.t(new_item_code);
                        this_object.attributes.repromptSpeech = this_object.t(new_item_code);
                        this_object.response.speak(this_object.attributes.speechOutput).listen(this_object.attributes.repromptSpeech);
                        this_object.emit(':responseReady');
                    }
                });
            }
        });
    },
    'RetrieveLastIntent': function () {
        const { userId } = this.event.session.user;
        const this_object = this;
        
        var params = {
            TableName: DbTable,
            FilterExpression: "#u = :u",
            ExpressionAttributeNames: {
                "#u": "userId",
            },
            ExpressionAttributeValues: { ":u": userId }
        
        };
        var my_result = docClient.scan(params, onScan);
        console.log('scan completed');
        //console.log(JSON.stringify(my_result));
        
        
        function onScan(err,data) {
            var my_result = {};
            if (err) {
                console.error("Unable to scan item. Error JSON:", JSON.stringify(err, null, 2));
            } else {
                console.log('data retreived');
                // sort the reults to find the largest CreationTimestamp
                
                data.Items.forEach(function(itemdata) {
                    console.log('testing');
                    console.log(JSON.stringify(itemdata.CreationTimestamp));
                    const timestamp = itemdata.CreationTimestamp;
                    if (timestamp != undefined && (my_result.CreationTimestamp == undefined || timestamp > my_result.CreationTimestamp)) {
                        my_result = itemdata;
                    }
                });
                
                
                if (typeof data.LastEvaluatedKey != "undefined") {
                    console.log("Scanning for more...");
                    params.ExclusiveStartKey = data.LastEvaluatedKey;
                    var new_result = docClient.scan(params, onScan);
                    if (new_result.CreationTimestamp != undefined && (my_result.CreationTimestamp == undefined || my_result.CreationTimestamp < new_result.CreationTimestamp)) {
                        my_result = new_result;
                        
                    }
                }
            }
            const DB_get_params = {
                TableName: DbTable,
                Key: {
                    userId: my_result.userId,
                    sessionId: my_result.sessionId
                }
            };
            console.log(JSON.stringify(DB_get_params));
            docClient.get(DB_get_params, function(err, data) {
                if (err) {
                    console.error("Unable to retreive item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    //console.log(data);
                    var response_string = "We have found a record, the issue recorded was...";
                    response_string += data.Item.ChecklistItem1;
                    this_object.attributes.speechOutput = response_string;
                    //this_object.attributes.repromptSpeech = this_object.t(new_item_code);
                    this_object.response.speak(this_object.attributes.speechOutput);
                    this_object.emit(':responseReady');
                }
            });
            return my_result;
        }
        
    },
    'AMAZON.HelpIntent': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');

        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.RepeatIntent': function () {
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'AMAZON.CancelIntent': function () {
        this.emit('SessionEndedRequest');
    },
    'SessionEndedRequest': function () {
        console.log(`Session ended: ${this.event.request.reason}`);
    },
    'Unhandled': function () {
        this.attributes.speechOutput = this.t('HELP_MESSAGE');
        this.attributes.repromptSpeech = this.t('HELP_REPROMPT');
        this.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech);
        this.emit(':responseReady');
    },
};

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageStrings;
    alexa.registerHandlers(handlers);
    alexa.execute();
};
