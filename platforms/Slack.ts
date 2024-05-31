/**
 * Slack-specific Payload Formatting
 */
namespace Slack {
  /**
   * Creates a payload to send when a new confession is submitted to the Google Form
   * @param confession The confession message
   * @param timestamp The Javascript Timestamp that the confession was sent at
   * @param date A Date object created using that Javascript object
   * @param handle The slack handle to target, or "" if no handle was selected.
   * @param url A URL that points directly to the Confession cell
   * @returns A formatted payload to send to the Webhook URL
   */
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


  /**
   * Creates a payload to send as a reminder when a confession is queued to be posted on that day.
   * @param pings The formatted "pings" line, including the pre- and post-fix
   * @param confession The formatted confession line, including the confession number at the start
   * @param url A URL that points directly to the Confession cell
   * @returns A formatted payload to send to the Webhook URL
   */
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