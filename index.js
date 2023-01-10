const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  PermissionsBitField,
  Permissions,
} = require("discord.js");

const prefix = "sh!";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once("ready", () => {
  console.log("Shimizu is live.");

  client.user.setStatus("available");
  client.user.setActivity(`sh!help - doing ur mom`, {
    //msg shown
    type: "COMPETING",
    url: "", //optional
  });
});

client.on("messageCreate", (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  //message array
  const messageArray = message.content.split(" ");
  const argument = messageArray.slice(3);
  const cmd = messageArray[0];

  //commands

  //lists all bot commands
  if (command === "help") {
    message.channel.send(
      "```Commands (sh!): \nsh!snipers # - checks for potential lootrun snipers on the specified world\nsh!cf - flip a coin\nsh!memes - sends a random meme\nsh!quote - generates random anime quote```"
    );
  }

  //lists all potential lootrun snipers on a wynncraft world
  if (command === "snipers") {
    const https = require("https");

    //prompts for retrieval commands
    var wc = args;
    var lrlist = [];
    var counter = 0;
    var numPlayers;

    //JSON Parser
    function jsonParser(stringValue) {
      var string = JSON.stringify(stringValue);
      var objectValue = JSON.parse(string);
      return objectValue["WC" + wc];
    }

    //checks if the specific class is a meta lootrun class (e.g. mage, archer, warrior)
    function checkLRClass(stringType) {
      if (
        stringType == "MAGE" ||
        stringType == "ARCHER" ||
        stringType == "WARRIOR" ||
        stringType == "DARKWIZARD" ||
        stringType == "HUNTER" ||
        stringType == "KNIGHT"
      ) {
        return true;
      }
      return false;
    }

    //checks if player is a potential lootrunner
    function isLootRunner(objectClass) {
      for (let i = 0; i < objectClass.length; i++) {
        let stringType = String(objectClass[i].type);
        if (
          (checkLRClass(stringType) == true) &
          (lrLevel(objectClass[i].skills) == true) &
          (parseInt(Object.values(objectClass[i].skills)[2]) >= 80)
        ) {
          return true;
        }
      }
      return false;
    }

    //prints skill point distribution in a line
    function skillsPrint(objectSkills) {
      let skillsArray = Object.values(objectSkills);
      let skillsString = "";
      for (let i = 0; i < skillsArray.length; i++) {
        //conditional here for defense sp as wynnAPI has double defense sp???
        if (i != 4) {
          skillsString += String(" " + skillsArray[i]);
        }
      }
      return skillsString;
    }

    //checks if max or close to max level (198-200sp)
    function lrLevel(objectSkills) {
      let skillsArray = Object.values(objectSkills);
      let sumSkills = 0;

      for (let i = 0; i < skillsArray.length; i++) {
        //conditional here for defense sp as wynnAPI has double defense sp???
        if (i != 4) {
          sumSkills += parseInt(skillsArray[i]);
        }
      }

      if (sumSkills >= 198) {
        return true;
      }
      return false;
    }

    //gets specific player lootrun class data + sp distributions
    function printLRSP(username) {
      https.get(
        `https://api.wynncraft.com/v2/player/${username}/stats`,
        (resp) => {
          let body = "";

          resp.on("data", (chunk) => {
            body += chunk;
          });

          resp.on("end", () => {
            data = JSON.parse(body);
            //assign specific dataset to variable for tidiness
            let dataset = Object.values(data.data[0].characters);
            assembleLRList(dataset);
          });
        }
      );
    }

    function assembleLRList(dataset) {
      counter += 1;

      if (isLootRunner(dataset) == true) {
        lrlist.push("\n[" + String(data.data[0].username) + "]");
      }

      for (let i = 0; i < dataset.length; i++) {
        let skillsArray = Object.values(dataset[i].skills);
        if (
          (lrLevel(dataset[i].skills) == true) &
          (checkLRClass(String(dataset[i].type)) == true)
        ) {
          if (parseInt(skillsArray[2]) >= 80) {
            lrlist.push(
              " " +
                String(dataset[i].type) +
                " || Lv." +
                String(dataset[i].level) +
                " || SP:" +
                skillsPrint(dataset[i].skills)
            );
          }
        }
      }

      if (counter >= numPlayers) {
        console.log(lrlist);
        message.channel.send("```" + lrlist.toString() + "```");
      }
    }

    //gets all online players on a world
    https.get(
      "https://api-legacy.wynncraft.com/public_api.php?action=onlinePlayers",
      (resp) => {
        let body = "";

        //adding chunks to body object
        resp.on("data", (chunk) => {
          body += chunk;
        });

        //on end of response, parse into JSON object and read.
        resp.on("end", () => {
          let data = JSON.parse(body);

          if (data["WC" + wc] != undefined) {
            let plist = data["WC" + wc];
            lrlist.push("Potential Snipers on WC" + wc + ": ");

            numPlayers = plist.length;

            for (let i = 0; i < plist.length; i++) {
              printLRSP(plist[i]);
            }
          } else {
            message.channel.send(
              "Invalid World - Please Double Check World Number."
            );
          }
        });
      }
    );
  }

  //flips a coin
  if (command === "cf") {
    var result = Math.floor(Math.random() * 2);

    if (result == 0) {
      message.channel.send("Heads!");
    } else {
      message.channel.send("Tails!");
    }
  }

  //grabs a random meme from meme subreddit api and sends it
  if (command === "memes") {
    let body = "";
    const https = require("https");

    https.get(`https://meme-api.com/gimme`, (resp) => {
      resp.on("data", (chunk) => {
        body += chunk;
      });

      resp.on("end", () => {
        let data = JSON.parse(body);

        message.channel.send(data.preview[data.preview.length - 1]);
      });
    });
  }

  //sends a random anime quote
  if (command === "quote") {
    let body = "";
    const https = require("https");

    https.get("https://animechan.vercel.app/api/random", (resp) => {
      resp.on("data", (chunk) => {
        body += chunk;
      });

      resp.on("end", () => {
        let data = JSON.parse(body);

        message.channel.send(
          data.quote + "\n*-" + data.character + ", " + data.anime + "*"
        );
      });
    });
  }
});

//keep as last line in file
client.login("token");
