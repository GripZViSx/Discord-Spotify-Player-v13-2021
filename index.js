const { Client, Intents, VoiceChannel, MessageEmbed } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  NoSubscriberBehavior,
  AudioPlayerStatus,
} = require("@discordjs/voice");
const config = require("./config.json");
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MEMBERS,
  ],
});
let player = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Pause,
  },
});

client.setMaxListeners(100);
const { getData, getPreview, getTracks } = require("spotify-url-info");
const { Joinvc } = require("./functions");

client.on("ready", async () => {
  console.log(`Me is Online`);
  client.user.setStatus("invisible");
  client.user.setActivity(`Spotify Songs`, { type: "PLAYING" });
  // if you want to join your to a Voice Channel when bot is online so use this function
  const channel = client.channels.cache.get("886437128391782414");
  Joinvc(channel,player)
});

client.on("voiceStateUpdate", async (oldState, newState) => {
  if (
    newState.channelId &&
    newState.channel.type === "GUILD_STAGE_VOICE" &&
    newState.guild.me.voice.suppress
  ) {
    try {
      await newState.guild.me.voice.setSuppressed(false);
    } catch (e) {}
  }
});

client.on("messageCreate", (message) => {
  try {
    let prefix = config.prefix;
    if (!message.guild) return;
    if (!message.content.startsWith(prefix)) return;
    let args = message.content.slice(prefix.length).trim().split(/ +/);
    let cmd = args.shift().toLowerCase();
    switch (cmd) {
      case "ping":
        let pingembed = new MessageEmbed().setDescription(
          `💥 Ping :- \`${client.ws.ping}\``
        );
        message.channel.send({ embeds: [pingembed] });
        break;
      case "play":
        let { channel } = message.member.voice;
        if (!channel)
          return message.channel.send(`**Please Join a Voice Channel**`);
        let song = args.join(" ");
        if (!song) return message.channel.send(`**Please Give me song Link**`);
        getPreview(song).then((newsong) => {
          let VoiceConnection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
          });
          const resource = createAudioResource(newsong.audio, {
            inlineVolume: true,
          });
          resource.volume.setVolume(0.5);
          VoiceConnection.subscribe(player);
          player.play(resource);
          // player event
          player.on("subscribe", () => {
            let playembed = new MessageEmbed()
              .setColor("BLURPLE")
              .setDescription(
                `**Started Playing**\n [${newsong.title}](${newsong.link}) [<@${message.author.id}>] \n Author :- \`${newsong.artist}\` - Uploaded :- \`${newsong.date}\``
              )
              .setThumbnail(newsong.image);
            message.channel.send({ embeds: [playembed] });
          });
          player.on("unsubscribe", () => {
            let endembed = new MessageEmbed().setDescription(
              `\` Song Ended \``
            );
            message.channel.send({ embeds: [endembed] });
          });
          player.on("error", (error) => {
            console.error("Error:", error.message, "with track", newsong.title);
          });
        });
        break;
      case "stop":
        player.stop();
        message.channel.send(`** Song Stopped By ** <@${message.author.id}>`);
        break;
      case "pause":
        player.pause();
        message.channel.send(`** Song Paused By ** <@${message.author.id}>`);
        break;
      case "unpause":
        player.stop(false);
        message.channel.send(`** Song Unpaused By ** <@${message.author.id}>`);
        break;
      case "join":
        // let { channel } = message.member.voice;
        let VoiceConnection = joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });
        VoiceConnection.subscribe(player);
        break;
      case "help":
        let helpembed = new MessageEmbed()
          .setColor("NAVY")
          .setTitle(`🔰 My Help Menu`)
          .setDescription(
            `i am a Basic Spotify Player. Coded By <@882481863661342770> , If You want to use me Make Sure Credit Him \n\n ** Here is My All Commands **`
          )
          .addFields([
            {
              name: "play",
              value: "Play Spotify Url Song",
              inline: true,
            },
            {
              name: "stop",
              value: "Stop the Playing Curretly Song",
              inline: true,
            },
            {
              name: "pause",
              value: "Pause the Playing Curretly Song",
              inline: true,
            },
            {
              name: "unpause",
              value: "Unpause the Paused Song",
              inline: true,
            },
            {
              name: "help",
              value: "Show all My Commands",
              inline: true,
            },
            {
              name: "join",
              value: "Join Your Voice Channel",
              inline: true,
            },
            {
              name: "ping",
              value: "Show My Ping",
              inline: true,
            },
          ]);

        message.channel.send({ embeds: [helpembed] });
        break;
      default:
        message.channel.send(
          `** 😒 Not Valid Command type** \`${prefix}help\``
        );
        break;
    }
  } catch (e) {
    console.error(e);
  }
});


client.login(config.token);
