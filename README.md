<h1 align="center">Publisher 📢</h1>

### What is it?
Publisher is a Discord bot that automatically publishes messages sent in [announcement channels](https://support.discord.com/hc/en-us/articles/360032008192-Announcement-Channels-)

### Why?
Discord does not have this feature!

### How do I use it?
**Prefix**: `@Publisher`

### Commands
**Command**: `publish`\
**Alias**: `p`\
**Description**: Manually publish a message\
**Permissions**: Both the bot and user must have `MANAGE_MESSAGES` (unless the user is also the message author)\
**Usage**: `publish <msg_id_to_publish|msg_url_to_publish>`

**Command**: `autopublish`\
**Alias**: `auto`\
**Description**: Edit channels on the autopublish list\
**Info**: When you post a message in an autopublish channel, the bot will react with a reaction for 2 seconds:\
📢 - The message was successfully published\
⏲️ - The bot has already published 10 messages in the last hour\
❗ - The message was already published\
**Permissions**: `MANAGE_CHANNELS`\
**Usage**: `autopublish [add|remove [channel]]`

**Command**: `help`\
**Alias**: `h`\
**Description**: Get a list of commands\
**Usage**: `help`

**Command**: `invite`\
**Description**: Invite the bot\
**Usage**: `invite`

**Command**: `support`\
**Description**: Get an invite to the [support server](https://discord.gg/bFDZqcTFt5)\
**Usage**: `support`

### What permissions does it need?
The bot requires `MANAGE_MESSAGES`, which is the permission Discord requires to publish messages sent by users other than yourself.
