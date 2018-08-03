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
    // template for intent function for saving to the database
    'YourIntentName': function () { // change the name to match your intent name
        console.log("Hello World"); // use this for debugging. you can replace "Hello World" with a variable if you need
         if (this.event.request.dialogState !== 'COMPLETED') {
            this.emit(':delegate');
        } else {

            // create useful variables
            const { userId } = this.event.session.user; //store the user id if needed
            const { sessionId } = this.event.session; // store the session id if needed
            //make 'this' available in callbacks
            const this_object = this;
            
            // read intent slots
            // const 'slot_name' = this.event.request.intents.slots.'slot_name_from_alexa_developer'.value 
            const responseSlot = this.event.request.intent.slots.Response.value; // this can be repeated for each slot attached to this intent

            // storing data in table
            // to store data in a table you need to create a DB_put_params array
            const DB_put_params = {
                TableName: "IT_SUPPORT_TABLE_2", // set the name of the table you are saving into
                Item: { 
                    // "primary key name": "primary key value" - change these to match your table EG.
                    userId: userId, // first set the name and value for the primary key/collumn
                    // "sort key name": "sort key value" - change these to match your table or leave out if no sort key. EG.
                    sessionId: sessionId, // set the name and value for the sort key/collumn
                    // "your made up column name": "you column value" - you can save anything to your table. EG.
                    ChecklistItemNumber: 1, // set the collumn name and value for any data you wish to save. These can be anything you like.
                    CreationTimestamp: new Date().getTime(), // same as above.
                    Slot_response: responseSlot // EG. this line saves the value of the slot in a collumn called 'Slot_response'.
                }
            };
            // next call the put function. 
            // This function requires confirmation of the save to the table.
            // This means that any code required to run after the save needs to be in the callback of the put function.
            // Any code left outside the put function will run before the save has been confirmed so don't do that.
            docClient.put(DB_put_params, function (err, data) { // this line sends the put_params to the table.
                if (err) { // if the table fails to save this block is run
                    console.error("Unable to put item. Error JSON:", JSON.stringify(err, null, 2)); // this logs the error to the console.
                    // If you want error handling put code here
                    // EG. you may want Alexa to say "An error has occured..."
                    this_object.attributes.speechOutput = "An error has occured..."; // this is the responce alexa will say
                    this_object.attributes.repromptSpeech = "An error has occured..."; // this is the reprompt text Alexa will say
                    this_object.response.speak(this_object.attributes.speechOutput).listen(this_object.attributes.repromptSpeech); //this tells alexa to say speechOutput and repromptSpeech
                    this_object.emit(':responseReady'); // this line finishes the intent function

                } else { // if the save to the table was successful this block will run
                    // Now that you have saved the data you can continue your code in this block
                    console.log(JSON.stringify(data, null, 2)); // this logs the saved data to the console.
                    // Example of Alexa confirming that data is saved.
                    this_object.attributes.speechOutput = "Data saved successfully"; // this is the responce alexa will say
                    this_object.attributes.repromptSpeech = "What would you like to do now?"; // this is the repromp text Alexa will say
                    this_object.response.speak(this_object.attributes.speechOutput).listen(this_object.attributes.repromptSpeech); //this tells alexa to say speechOutput and repromptSpeech
                    this_object.emit(':responseReady'); // this line finishes the intent function
                    
                }
            });
        }
        // do not put any code after the calling database functions.
    },
    // template for intent function for retreiving from the database
    'YourIntentName2': function () { // change the name to match your intent name
        console.log("Hello World"); // use this for debugging. you can replace "Hello World" with a variable if you need
         if (this.event.request.dialogState !== 'COMPLETED') {
            this.emit(':delegate');
        } else {

            // create useful variables
            const { userId } = this.event.session.user; //store the user id if needed
            const { sessionId } = this.event.session; // store the session id if needed
            //make 'this' available in callbacks
            const this_object = this;
            
            // read intent slots
            // const 'slot_name' = this.event.request.intents.slots.'slot_name_from_alexa_developer'.value 
            const responseSlot = this.event.request.intent.slots.Response.value; // this can be repeated for each slot attached to this intent

            // retreiving data from table
            // there are 2 ways you may want to retreive data from a table.
            // 1. you may want to select a number of rows.
            // 2. you may want to select a single row. 
            // We will look at selecting multiple rows first
            // to retreive data in a table you need to create a DB_scan_params array
            var DB_scan_params = { 
                TableName: "your table name", // set to your table name
                FilterExpression: "#u = :u", // '#u' = collumn name set in 'ExpressionAttributeNames', ':u' = column value set in 'ExpressionAttributeValues'.
                ExpressionAttributeNames: {
                    "#u": "userId", // column name. must be primary key.s
                },
                ExpressionAttributeValues: { ":u": userId } // value of primary key column you wish to retrieve
            
            };
            // next call the scan function. 
            // This function requires confirmation of the save to the table.
            // This means that any code required to run after the scan needs to be in the callback of the scan function.
            // Any code left outside the scan function will run before the scan has been confirmed so don't do that.
            docClient.scan(DB_scan_params, function(err, data) {
                if (err) { // if scan fails this block is called
                    console.error("Unable to scan item. Error JSON:", JSON.stringify(err, null, 2)); // log the error to the console.
                    // If your skill includes error handling include it here. For more details see priviouse example for put function.
                    
                } else { // if scan finds any rows this block is called
                    // the scan has successfully returned data so you can continue your function in this block
                    var my_result_string = ''; // We will use this variable to store a responce that includes data from each row.
                    var my_matches = 0; // this variable will count how many matches we get against the intent slot value.
                    my_result_string += 'I have found ' + data.Items.length.stringify() + ' items. '; // start by including the number of items returned.
                    // the scan may return multiple rows so you will need to cycle through them to extract data from each
                    data.Items.forEach(function(itemdata, index) { // this cycles through the rows returned from the scan.
                        // to specify a column value use itemdata.'your column name' EG. itemdata.timestamp
                        my_result_string += 'Item number ' + index + ' was saved at ' + new Date(itemdata.timestamp).toString() + ' '; // In this line I add the data from the row to my response string.
                        // You may want to check the rows for a match with the slot from alexa
                        if (responseSlot == itemdata.ChecklistItem1) { // this line checks to see if the slot value matches the value in the table for collumn 'ChecklistItem1'. The block is run only if there is a match
                            my_result_string += 'And this item matches your slot value '; // update the response string for this matching items only.
                            my_matches += 1; // adds 1 to the matches counter.
                        }
                    });
                    // Now I have cycled through all the rows and gathered the data I need for the response.
                    my_result_string += ' There where ' + my_matches.toString() + ' matches found.'; // update the response to include the number of results that matched against the slot value.
                    this_object.attributes.speechOutput = my_result_string; // this is the responce alexa will say
                    this_object.attributes.repromptSpeech = "What would you like to do now?"; // this is the repromp text Alexa will say
                    this_object.response.speak(this.attributes.speechOutput).listen(this.attributes.repromptSpeech); //this tells alexa to say speechOutput and repromptSpeech
                    this_object.emit(':responseReady'); // this line finishes the intent function
                }
            });
            // noramlly there would be no lines of code after calling the scan function.
            // If scan is what you need remove the following code otherwise remove the above call to scan and use get only
            // We will now look at option 2. retrieving a single row from a table.
            // To retrieve a single row from a table you need to create a DB_get_params array.
            const DB_get_params = { // To get a single row from a table you must know the values of the primary and sort key of the row you wish to retrieve.
                TableName: "your table name", // set this to your table name
                Key: {
                    userId: userId, // you must include the primary key value
                    sessionId: sessionId // if your table has a sort key you must include the sort key value.
                }
            };
            // next call the get function.
            docClient.get(DB_get_params, function(err, data) {
                if (err) { // if get fails this block is called
                    console.error("Unable to retreive item. Error JSON:", JSON.stringify(err, null, 2)); // log the error to the console.
                    // If your skill includes error handling include it here. For more details see priviouse example for put function.
                    
                } else { // if get finds a rows this block is called
                    console.log(data); // logs the returned row to the console.
                    var response_string = "We have found a record, the issue recorded was..."; // create a string to store the responce
                    // to get a column value from the row use data.Item.'your column name' EG data.Item.timestamp
                    response_string += data.Item.ChecklistItem1; // this adds the value of the column called 'ChecklistItem1' to the response string.
                    this_object.attributes.speechOutput = response_string; // this is the responce alexa will say
                    this_object.attributes.repromptSpeech = "What would you like to do now?"; // this is the repromp text Alexa will say
                    this_object.response.speak(this_object.attributes.speechOutput).listen(this.attributes.repromptSpeech); //this tells alexa to say speechOutput and repromptSpeech
                    this_object.emit(':responseReady'); // this line finishes the intent function
                }
            });
        }
        // do not put any code after the calling database functions.
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
        
        // docClient.scan(params, onScan);
        // var count = 0;
        
        // function onScan(err, data) {
        //     if (err) {
        //         console.error("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        //     } else {        
        //         console.log("Scan succeeded.");
        //         data.Items.forEach(function(itemdata) {
        //           console.log("Item :", ++count,JSON.stringify(itemdata));
        //         });
        
        //         // continue scanning if we have more items
        //         if (typeof data.LastEvaluatedKey != "undefined") {
        //             console.log("Scanning for more...");
        //             params.ExclusiveStartKey = data.LastEvaluatedKey;
        //             docClient.scan(params, onScan);
        //         }
        //     }
        // }
        
        
        
        //query the database for the larget stored timestamp
        //need to get all results then sort the array.
        // const params = {
        //     TableName: DbTable,
        //     ProjectionExpression: " #u, #s, CreationTimestamp",
        //     ExpressionAttributeNames: {
        //         "#s": "sessionId",
        //         "#u": "userId"
        //     },
        //     ExpressionAttributeValues: { 
        //         ":s":  "*",
        //         ":u":  userId
        //     },
        //     KeyConditionExpression: "#u = :u AND #s = :s",
        //     ScanIndexForward: true,
        // };
        
        // docClient.query(params, function(err,data) {
        //     if (err) {
        //         console.error("Unable to scan item. Error JSON:", JSON.stringify(err, null, 2));
        //     } else {
        //         console.log(data);
        //         // sort the reults to find the largest CreationTimestamp
        //         const my_result = {};
        //         for (var i = 0; i < data['items'].length; i++) {
        //             const timestamp = data['items'][i]['CreationTimestamp'];
        //             if (timestamp != null && timestamp > my_result['CreationTimestamp']) {
        //                 my_result = data['items'][i];
        //             }
        //         }
        //         const DB_get_params = {
        //             TableName: DbTable,
        //             Key: {
        //                 userId: my_result['userId'],
        //                 sessionId: my_result['LastEvaluatedKey']['sessionId']
        //             }
        //         };
        //         docClient.get(DB_get_params, function(err, data) {
        //             if (err) {
        //                 console.error("Unable to retreive item. Error JSON:", JSON.stringify(err, null, 2));
        //             } else {
        //                 console.log(data);
        //                 var response_string = "We have found a record, the issue recorded was...";
        //                 response_string += data['Item']['ChecklistItem1'];
        //                 this_object.attributes.speechOutput = response_string;
        //                 //this_object.attributes.repromptSpeech = this_object.t(new_item_code);
        //                 this_object.response.speak(this_object.attributes.speechOutput);
        //                 this_object.emit(':responseReady');
        //             }
        //         });
                
        //     }
        // });
         
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
