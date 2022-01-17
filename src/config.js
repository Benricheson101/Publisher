/* eslint no-useless-escape: 0 */

const constants = {
  PERMISSIONS: 8192, // MANAGE_MESSAGES
  SUPPORT: 'bFDZqcTFt5',
  REGEX: {
    MSG_URL: new RegExp('https?:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/channels\/(?<guild>\\d{16,18})\/(?<channel>\\d{16,18})\/(?<message>\\d{16,18})'),
    SNOWFLAKE: new RegExp('\d{16,18}'),
    PARSE_CMD (client) {
      return new RegExp(`^(?<prefix><@!?${client.user.id}>)\\s?(?<command>\\w+)\\s?(?<args>.*)?`)
    }
  }
}

module.exports = { constants }
