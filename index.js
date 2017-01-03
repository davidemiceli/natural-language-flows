// Natural language flows for bots
exports.Bot = function() {
    this.commands = [];
    this.NonMatchedReply = "Sorry, I do not understand...";
    this.lastReply = null;
    this.AddCommand = function(theCommand) {
        this.commands.push(theCommand);
    };
    this.AddMultipleCommands = function(theCommands) {
        for (var CmD in theCommands) {
            this.AddCommand(theCommands[CmD]);
        }
    };
    this.command = function(text, utterances, entities) {
        // Make entities arrays of unique items
        for (var ent in entities) {
            entities[ent] = entities[ent].filter(function(anitem, apos) {
                return entities[ent].indexOf(anitem) == apos;
            });
        }
        var ThisIdentities = {};
        var IntentResult = {text: String(text), intent: false, entities: {}};
        for (ut=0; ut<utterances.length; ut++) {
            filledintent = String(utterances[ut]);
            // Fill the placeholders with the corresponding entities
            for (var ent in entities) {
                filledintent = filledintent.replace( new RegExp('{'+ent+'}'), '('+entities[ent].join('|')+')' );
            }
            // Check the text is ugual to the text filled with entities
            if ( new RegExp('^'+filledintent+'$').test(text) ) {
                IntentResult.intent = true;
                // Track the entities filled in
                for (var ent in entities) {
                    for (var IndEnt=0; IndEnt<entities[ent].length; IndEnt++) {
                        textArray = text.match( new RegExp('\\b'+entities[ent][IndEnt]+'\\b', 'g') );
                        filledArray = filledintent.match( new RegExp('\\b'+entities[ent][IndEnt]+'\\b', 'g') );
                        if (filledArray && filledArray[0] && textArray && (filledArray.length === textArray.length)) {
                            if (!ThisIdentities[ent]) ThisIdentities[ent] = [];
                            ThisIdentities[ent].push( String(filledArray[0]) );
                        }
                    }
                }
                break;
            }
        }
        // Return the result
        IntentResult.entities = ThisIdentities;
        return IntentResult;
    };
    this.answer = function(thereply) {
        for (var CmD in this.commands) {
            singleCMD = Object.assign({}, this.commands[CmD]);
            // console.log(singleCMD.intent, singleCMD.intent, '==', thereply.context);
            if (singleCMD.no_need_context || (singleCMD.intent == thereply.context)) {
                esit = this.command(thereply.text, singleCMD.utterances, singleCMD.entities);
                if (esit && esit.intent) {
                    esit.reply = String(this.commands[CmD].response.default);
                    esit.context = String(this.commands[CmD].response.context);
                    this.lastReply = String(esit.reply);
                    // console.log('hhh', esit)
                    if (this.commands[CmD].response.conditionals) {
                        for (var condt in this.commands[CmD].response.conditionals) {
                            hasMatchTheResp = true;
                            for (var ent in esit.entities) {
                                hasMatchTheResp = (this.commands[CmD].response.conditionals[condt].conditions[ent] == esit.entities[ent]) ? hasMatchTheResp : false;
                            }
                            if (hasMatchTheResp) {
                                esit.reply = String(this.commands[CmD].response.conditionals[condt].resp);
                                esit.context = String(this.commands[CmD].response.conditionals[condt].context);
                                this.lastReply = String(esit.reply);
                                break;
                            }
                        }
                    }
                    return esit;
                }
                delete esit;
            }
        }
        return {
            text: thereply.text,
            intent: null,
            entities: {},
            reply: this.NonMatchedReply,
            context: singleCMD.intent
        };
    }
};