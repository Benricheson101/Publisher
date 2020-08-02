/* eslint no-useless-escape: 0 */

export const constants = {
  PERMISSIONS: 8192, // MANAGE_MESSAGES
  SUPPORT: 'xfe9tcW',
  REGEX: {
    MSG_URL: new RegExp('https?:\/\/(?:canary\.|ptb\.)?discord(?:app)?\.com\/channels\/(?<guild>\\d{16,18})\/(?<channel>\\d{16,18})\/(?<message>\\d{16,18})'),
    PARSE_CMD (client) {
      return new RegExp(`^(?<prefix><@!?${client.user.id}>)\\s?(?<command>\\w+)\\s?(?<args>.*)?`)
    }
  }
}
