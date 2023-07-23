const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const botToken = '6130628073:AAFr-1tf1n4Qy6-jeYfaC8CAv-q-O84syr0';
const bot = new TelegramBot(botToken, { polling: true });

// fetch random Wikipedia content with a summary
async function getRandomWikipediaSummary() {
  try {
    const response = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        format: 'json',
        list: 'random',
        rnlimit: 1,
        rnnamespace: 0, 
      },
    });

    const articleTitle = response.data?.query?.random?.[0]?.title;
    if (!articleTitle) {
      return 'Failed to fetch Wikipedia content. Please try again later.';
    }

    const articleResponse = await axios.get('https://en.wikipedia.org/w/api.php', {
      params: {
        action: 'query',
        format: 'json',
        prop: 'extracts',
        exintro: true,
        explaintext: true,
        titles: articleTitle,
      },
    });

    const articleData = articleResponse.data?.query?.pages;
    const articleId = Object.keys(articleData)[0];
    const articleSummary = articleData[articleId]?.extract;

    return {
      title: articleTitle,
      summary: articleSummary,
    };
  } catch (error) {
    console.error('Error fetching Wikipedia content : ', error.message);
    return 'Failed to fetch Wikipedia content. Please try again later.';
  }
}

// handler
bot.onText(/\/randomwiki/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const data = await getRandomWikipediaSummary();
    const responseMessage = `${data.title}\n\n${data.summary}`;
    bot.sendMessage(chatId, responseMessage);
  } catch (error) {
    console.error('Error handling /randomwiki command:', error.message);
    bot.sendMessage(msg.chat.id, 'An error occurred. Please try again later.');
  }
});

// handler for other topics
bot.onText(/^(?!\/randomwiki)/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const topic = msg.text;
    const wikipediaLink = `https://en.wikipedia.org/wiki/${encodeURIComponent(topic)}`;
    bot.sendMessage(chatId, `Here's the Wikipedia link for "${topic}":\n${wikipediaLink}`);
  } catch (error) {
    console.error('Error handling topic command:', error.message);
    bot.sendMessage(msg.chat.id, 'An error occurred. Please try again later.');
  }
});


console.log('Telegram bot is running successfully');
