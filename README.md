**THIS PROJECT HAS BEEN MIGRATED OVER TO GITLAB: [mx-puppet-bridge](https://gitlab.com/mx-puppet/slack/mx-puppet-slack)**

[![Support room on Matrix](https://img.shields.io/matrix/mx-puppet-bridge:sorunome.de.svg?label=%23mx-puppet-bridge%3Asorunome.de&logo=matrix&server_fqdn=sorunome.de)](https://matrix.to/#/#mx-puppet-bridge:sorunome.de)[![donate](https://liberapay.com/assets/widgets/donate.svg)](https://liberapay.com/Sorunome/donate)

# mx-puppet-slack
This is a slack puppeting bridge for matrix. It is based on [mx-puppet-bridge](https://github.com/Sorunome/mx-puppet-bridge) and provide multi-user instances.

## Quick start using Docker

Docker image can be found at https://hub.docker.com/r/sorunome/mx-puppet-slack

For docker you probably want the following changes in `config.yaml`:

```yaml
bindAddress: '0.0.0.0'
filename: '/data/database.db'
file: '/data/bridge.log'
```

Also check the config for other values, like your homeserver domain.

## Install Instructions (from Source)

* Clone and install:
    ```bash
    git clone https://github.com/Sorunome/mx-puppet-slack.git
    cd mx-puppet-slack
    yarn install
    ```
    
    If install complains about `node-canvas`, you can let it compile from
    source by installing the build dependencies and rerunning install:
   - For Ubuntu:
     ```bash
     sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
     ```
* Edit the configuration file and generate the registration file:
    ```bash
    cp sample.config.yaml config.yaml
    # fill info about your homeserver and Slack app credentials to config.yaml manually
    yarn start -r # generate registration file
    ```
* Copy the registration file to your synapse config directory.
* Add the registration file to the list under `app_service_config_files:` in your synapse config.
* Restart synapse.
* Start the bridge:
    ```bash
    yarn start
    ```
* Start a direct chat with the bot user (`@_slackpuppet_bot:domain.tld` unless you changed the config).
    (Give it some time after the invite, it'll join after a minute maybe.)
* Get your Slack tokens as below, and tell the bot user to link your workspaces:
    ```
    link MYTOKEN (see below for details)
    ```
* Tell the bot user to list the available rooms: (also see `help`)
    ```
    list
    ```
    Clicking rooms in the list will result in you receiving an invite to the bridged room.

## How to get Slack app credentials

### Option 1. Legacy Token
Get a legacy token from https://api.slack.com/custom-integrations/legacy-tokens and then chat with the bot user (`@_slackpuppet_bot:domain.tld` unless you changed the config):
```
link <token>
```

### Option 2. OAuth
To use OAuth
1. Set up a Slack app at https://api.slack.com/apps. You do not need to setup any
   of the additional features or functionality that Slack prompts you to enable when you
   create a new Slack app.
2. Go to the "OAuth & Permissions" tab in the sidebar
3. Add your redirect URL.
4. Fill in the `oauth` block in your `config.yaml` file. Be sure to forward the `oauth.redirectUri` to the bridge.
5. Start a chat with the bot user (`@_slackpuppet_bot:domain.tld` unless you changed the config)
6. Tell the bot: `link`
7. Click the link it gives and allow access
8. Copy the token given and send the bot that token with: `link TOKEN_YOU_COPIED`

### Option 3. xoxs token
**Warning:**: Linking your `xoxs` account's token is against Slack's Terms of Service.

First you must retrieve your `xoxs` token: Go to your slack customization page, e.g. https://my.slack.com/customize, and then open the debugging console
(F12 or rightclick --> inspect element).
Get the token by entering `TS.boot_data.api_token`.

After that, run:
```
link <token>
```


### Option 4. xoxc token
**Warning**: Linking your `xoxc` account's token is against Slack's Terms of Service.

First you must retrieve your `xoxc` token: In the network manager, filter for type WS/WebSocket, and the `xoxc` token is there as URL parameter of that request.

Next you will need to get the contents of your `d` cookie.

After that, run:
```
link <token> <d cookie contents>
```

## Relay
It is also possible to use mx-puppet-slack as a relay. For that, the events API needs to be configured. in `slack.path` you can configure the base-path for the various new endpoints. By default this is `/_matrix/slack/client`.

The events API will have appended `/events`, so by default `/_matrix/slack/client/events`.

The new oauth endpoint to add the slack bot to new teams has `/oauth/{appId}` appended, so by default `/_matrix/slack/client/events/{appId}`.

Create your slack app, give it the permissions and then link it with `link <appId> <clientId> <clientSecret> <signingSecret>`. Don't forget to `settype <puppetId> relay`!
