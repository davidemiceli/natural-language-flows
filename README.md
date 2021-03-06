# Natural language flows
A very simple prototype of Natural Language Flow builder and Natural Language Generator for bots, using edges of contexts, and based on intents/skills defined by the user.

## Installation
```
npm install natural-language-flows
```

Or use it into the browser:
```
<script type="text/javascript" src="lib/natural-language-flows.js"></script>

```

## How it works

Initialize on node.js
```javascript
// Require the natural language flows
var nlf = require('natural-language-flows');

// Initialize the bot
var bot = new nlf.Bot();
```

Initialize on the browser
```javascript
// Initialize the bot
var bot = new Bot();
```

Use it adding skills/intents
```javascript
// Set a default non matched reply
bot.NonMatchedReply = "Sorry, I do not understand...";

// Add some bot's skills/intents with edges of contexts
bot.AddMultipleCommands([
{
    intent: 'buy-car',
    utterances: [
        "I want to {action} a {product}",
        "I should {action} a {product}",
        "Can you {action} me one {product}?"
    ],
    entities: {
        action: ['buy','have','take','give'],
        product: ['car','automobile','ferrari','sport car']
    },
    response: {
        default: 'Yes, of course! Could you tell me which model of Ferrari? (F12/GTC4/J50/California T/488 GTB)',
        context: 'car-model',
        no_need_context: true
    }
},{
    intent: 'car-model',
    utterances: [
        "{model}",
    ],
    entities: {
        model: ['F12','GTC4','J50','California T','488 GTB']
    },
    response: {
        default: 'Oh, great! Do you confirm you want to purchase it? (yes/no)',
        context: 'car-yes-no'
    }
},{
    intent: 'car-yes-no',
    utterances: [
        "{qresp}",
    ],
    entities: {
        qresp: ['yes','no']
    },
    response: {
        default: 'Sorry, could you confirm the purchase? (yes/no)',
        context: 'car-yes-no',
        conditionals: [
            {
                conditions: {qresp: 'yes'},
                resp: 'Wonderful! A great purchase!',
                context: 'buy-car'
            },
            {
                conditions: {qresp: 'no'},
                resp: "I'm sorry, do you want buy another model? (F12/GTC4/J50/California T/488 GTB)",
                context: 'car-model'
            }
        ]
    }
}]);
```

Start a discussion with the bot after skills' training:

```javascript
// Printing the full discussion's objects
esit = bot.answer({text: 'I want to buy a ferrari', context: 'buy-car'});
console.log(esit);

esit = bot.answer({text: 'GTC4', context: esit.context});
console.log(esit);

esit = bot.answer({text: 'Maybe...', context: esit.context});
console.log(esit);

esit = bot.answer({text: 'yes', context: esit.context});
console.log(esit);
```

That will print the complete result object in this way:
```javascript
{ text: 'I want to buy a ferrari',
  intent: true,
  entities: { action: [ 'buy' ], product: [ 'ferrari' ] },
  reply: 'Yes, of course! Could you tell me which model of Ferrari? (F12/GTC4/J50/California T/488 GTB)',
  context: 'car-model' }
{ text: 'GTC4',
  intent: true,
  entities: { model: [ 'GTC4' ] },
  reply: 'Oh, great! Do you confirm you want to purchase it? (yes/no)',
  context: 'car-yes-no' }
{ text: 'Maybe...',
  intent: null,
  entities: {},
  reply: 'Sorry, I do not understand...',
  context: 'car-yes-no' }
{ text: 'yes',
  intent: true,
  entities: { qresp: [ 'yes' ] },
  reply: 'Wonderful! A great purchase!',
  context: 'buy-car' }
```

To print only the discussion data:

```javascript
// Only discussion's replies
esit = bot.answer({text: 'I want to buy a ferrari', context: 'buy-car'});
console.log('D:', esit.text);
console.log('R:', esit.reply);

esit = bot.answer({text: 'GTC4', context: esit.context});
console.log('D:', esit.text);
console.log('R:', esit.reply);

esit = bot.answer({text: 'Maybe...', context: esit.context});
console.log('D:', esit.text);
console.log('R:', esit.reply);

esit = bot.answer({text: 'no', context: esit.context});
console.log('D:', esit.text);
console.log('R:', esit.reply);

esit = bot.answer({text: 'California T', context: esit.context});
console.log('D:', esit.text);
console.log('R:', esit.reply);

esit = bot.answer({text: 'yes', context: esit.context});
console.log('D:', esit.text);
console.log('R:', esit.reply);
```

That will print:

```
D: I want to buy a ferrari
R: Yes, of course! Could you tell me which model of Ferrari? (F12/GTC4/J50/California T/488 GTB)
D: GTC4
R: Oh, great! Do you confirm you want to purchase it? (yes/no)
D: Maybe...
R: Sorry, I do not understand...
D: no
R: I'm sorry, do you want buy another model? (F12/GTC4/J50/California T/488 GTB)
D: California T
R: Oh, great! Do you confirm you want to purchase it? (yes/no)
D: yes
R: Wonderful! A great purchase!
```