const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

//Line channel access token and secret
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};

//openAI API key
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function generateChatResponse(message) {
  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: "Human:" + message,
      temperature: 0.9,
      max_tokens: 150,
      top_p: 1,
      frequency_penalty: 0.0,
      presence_penalty: 0.6,
      stop: [" Human:", " AI:"],
    });
    return response.data.choices[0].text;
  } catch (error) {
    if (error.response) {
      console.log(error.response.status);
      console.log(error.response.data);
    } else {
      console.log(error.message);
    }
    return "error";
  }
}

// async function handleLineBotEvent(event) {
//   const message = event.message.text;
//   const response = await generateChatResponse(message);
//   console.log("Received message:", message);
//   const replyMessage = {
//     type: "text",
//     text: response,
//   };
//   console.log("openAI response:", response);
//   await lineClient.replyMessage(event.replyToken, replyMessage);
// }

const express = require("express");
const app = express();
// const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.post("/", (req, res) => {
//   Promise.all(req.body.events.map(handleLineBotEvent)).then((result) => {
//     res.json(result);
//   });
// });
app.post("/", async (req, res) => {
  let message = req.body.events[0].message.text;
  let result = await generateChatResponse(message);

  let bodyData = {
    replyToken: req.body.events[0].replyToken,
    messages: [
      {
        type: "text",
        text: result,
      },
    ],
  };
  console.log(bodyData);
  fetch("https://api.line.me/v2/bot/message/reply", {
    body: JSON.stringify(bodyData),
    headers: {
      Authorization:
        "Bearer GpdKfQgZK8lGSUuJrep+t2flrMgYz03NP5WPTEPZV/MOtMSPDCq1AThEF9lJLcv1vkDUKyF38uyLSE3V0GcSweFc1uHsNoFfqaFYxMDRVvOBoRmlnE3stwapZpbkaLTouqTtmE9tqjRgPFyele35OwdB04t89/1O/w1cDnyilFU=",
      "Content-Type": "application/json",
    },
    method: "POST",
  })
    .then((d) => d.json())
    .then((result) => {
      console.log(result);
    });
  console.log(JSON.stringify(req.body));
  return res.send({});
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
