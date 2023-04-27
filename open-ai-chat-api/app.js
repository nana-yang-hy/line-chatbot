const line = require("@line/bot-sdk");
const express = require("express");
const app = express();
const {Configuration, OpenAIApi} = require("openai");
const fs = require("fs");
const https = require("https");
const logger = require('morgan');
require("dotenv").config();

const client = new line.Client({
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
})

//openAI API key
const configuration = new Configuration({
    organization: process.env.OPENAI_ORGANIZATION_ID,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// use GPT3.5 chatAPI create chat
async function generateChatResponse(message) {
    try {
        console.log(`user: ${message}`);
        const completion = await openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{role: "user", content: message}],
        });
        let result = completion.data.choices[0].message;
        console.log(result);
        return result;
    } catch (e) {
        console.error(e);
        return e;
    }
};

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// post user's message to get chat response
app.post("/chatbot", async (req, res) => {
    try {
        console.log(JSON.stringify(req.body));
        if(req.body.events.length === 0) {
            return res.status(200).json({});
        }
        let eventType = req.body.events[0].type;
        if (eventType === "follow") {
            let replyToken = req.body.events[0].replyToken;
            await client.replyMessage(replyToken, {
                type: "text",
                text: `Hi 很高興您加我好友！ \n我是一個聊天機器人，傳送任何文字訊息開始聊天吧～`
            });
            return res.status(200).json({});
        }
        let messageType = req.body.events[0].message.type;
        if (messageType !== "text") {
            let replyToken = req.body.events[0].replyToken;
            await client.replyMessage(replyToken, {type: "text", text: "抱歉，我只能處理文字訊息"});
            return res.status(200).json({});
        }
        let message = req.body.events[0].message.text;
        let result = await generateChatResponse(message);
        let replyToken = req.body.events[0].replyToken;
        await client.replyMessage(replyToken, {type: "text", text: result.content});
        return res.status(200).json({});
    } catch (e) {
        console.log('error');
        return res.status(400).json({});
    }
});

https.createServer({
    ca: fs.readFileSync("./auth/keys/ca_bundle.crt"),
    key: fs.readFileSync("./auth/keys/private.key"),
    cert: fs.readFileSync("./auth/keys/certificate.crt")
}, app).listen(8000, () => {
    console.log("Server is running on port 8000");
})
