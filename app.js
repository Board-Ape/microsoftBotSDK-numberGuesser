// Packages are installed for you
const { BotFrameworkAdapter, MemoryStorage, ConversationState } = require('botbuilder');
const restify = require('restify');

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
});

// Create adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Add conversation state middleware
const conversationState = new ConversationState(new MemoryStorage());
adapter.use(conversationState);

// Creating variables for game tracking
let randomNum = Math.floor((Math.random() * 100) + 1);
let winner = false;
let guesses = [];


server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, (context) => {
        // This bot is only handling Messages

        // Get the conversation state
        const state = conversationState.get(context);
         // If state.count is undefined set it to 0, otherwise increment it by 1
        let count = state.count === undefined ? state.count = 0 : ++state.count;

        if (count === 0) {
            return context.sendActivity(
                'Welcome to Number Guesser!' + 
                '\n' + '----------' +
                '\n' + 'Type: "new" to start a new game' +
                '\n' + 'Type: "rules" to learn to play');
        }

        if (context.activity.type === 'message' && context.activity.text.toLowerCase() === 'new') {
            randomNum = Math.floor((Math.random() * 100) + 1);
            winner = false;
            guesses = [];
            return context.sendActivity(
                "New Game" +
                "\n" + '----------' + 
                "\n" + "I\'m thinking of a number between 1-100. Try and guess!" + 
                "\n" +
                `(${randomNum})`);
        }

        if (context.activity.type === 'message' && context.activity.text.toLowerCase() === 'rules') {
            return context.sendActivity(
                "Rules" + 
                 "\n" + '----------' + 
                "\n" + "Object of the game is to guess my number." +
                "\n" + "I\'ll give you 5 guesses and hints along the way." +
                "\n" + "Type 'new' to begin a new game");
        }

        if (context.activity.type === 'message' && parseInt(context.activity.text) > 0 && parseInt(context.activity.text) < 101 && winner === false) {
            let userGuess = parseInt(context.activity.text);
            
            if (userGuess < randomNum && guesses.length < 4) {
                guesses.push(userGuess);
                context.sendActivity(`Your guess: "${userGuess}" is too Low` + 
                    "\n" +
                    `You have ${5 - guesses.length} guesses left`);
            }
            else if (userGuess > randomNum && guesses.length < 4) {
                guesses.push(userGuess);
                context.sendActivity(`Your guess: "${userGuess}" is too High ` + 
                    "\n" +
                    `You have ${5 - guesses.length} guesses left`);
            }
            else if (userGuess === randomNum)  {
                winner = true;
                context.sendActivity(
                    "Congratulations!" +
                    "\n" + '----------' +  
                    "\n" + `You guessed my number "${userGuess}" correctly.` +
                    "\n" + "Type 'new' to begin a new game");

            }
            else {
                context.sendActivity("Game Over" +
                    "\n" + '----------' +
                    "\n" + "Type 'new' to begin a new game" );
            }
        }
        else if (context.activity.type === 'message' && parseInt(context.activity.text) < 1 || parseInt(context.activity.text) > 100) {
            return context.sendActivity(`Your guess: "${context.activity.text}" is out of range! Please guess a number between 1-100`)
        }           
    });
});