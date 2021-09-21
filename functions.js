const { joinVoiceChannel } = require("@discordjs/voice");
// for voice channel
/**
 *
 * @param {VoiceChannel} channel
 */
const Joinvc = (channel, player) => {
  let channelcconn = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });
  channelcconn.subscribe(player);
};

module.exports = { Joinvc };
