namespace Slack {
  export function formatNewConfessionMessage(confession: string, timestamp: number, date: Date, handle: string, url: string) {
    handle = handle.replace("@", "");

    return {
      'blocks': [
        {
          'type': 'section',
          'text': {
            'type': 'mrkdwn',
            'text': App.messages.newConfession
          }
        }
      ],
      "attachments": [
        {
          "color": App.attachmentColor,
          "blocks": [
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": `*Confession:*\n${confession}`
              }
            },
            {
              "type": "section",
              "fields": [
                {
                  "type": "mrkdwn",
                  "text": `*When:*\n<!date^${Math.floor(timestamp / 1000)}^{date}|${date.toLocaleDateString('en-US')}>`
                },
                {
                  "type": "mrkdwn",
                  "text": `*Send to:*\n${(handle != "" && handle != null) ? `@${handle}` : `<#${App.channelId}>`}`
                }
              ]
            },
            {
              "type": "context",
              "elements": [
                {
                  "type": "mrkdwn",
                  "text": `<${url}|Jump to Confession>`
                }
              ]
            }
          ]
        }
      ]
    }
  }

  export function formatReminderMessage(pings: string, confession: string, url: string) {
    return {
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `${App.messages.reminderMessage}\n${pings}`
          }
        }
      ],
      "attachments": [
        {
          "color": App.attachmentColor,
          "blocks": [
            {
              "type": "section",
              "text": {
                "type": "mrkdwn",
                "text": `*Message:*\n\`\`\`${confession}\`\`\``
              }
            },
            {
              "type": "context",
              "elements": [
                {
                  "type": "mrkdwn",
                  "text": `<${url}|Jump to Confession>`
                }
              ]
            }
          ]
        }
      ]
    }
  }
}