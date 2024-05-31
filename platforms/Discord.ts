/**
 * Discord-specific Payload Formatting
 */
namespace Discord {
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
    // Convert color to an Octal if it isn't
    const color = typeof App.attachmentColor === "number" ? App.attachmentColor : parseInt(App.attachmentColor.replace('#', ''), 8);

    return {
      embeds: [
        {
          title: App.messages.newConfession,
          timestamp: date.toISOString(),
          color: color,
          fields: [
            {
              name: "Confession:",
              value: confession,
              inline: false
            },
            {
              name: "Send To:",
              value: (handle != "" && handle != null) ? `<@${handle}>` : `<#${App.channelId}>`,
              inline: false
            }
          ],
          author: {
            name: "Jump to Confession",
            url: url
          }
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
    // Convert color to an Octal if it isn't
    const color = typeof App.attachmentColor === "number" ? App.attachmentColor : parseInt(App.attachmentColor.replace('#', ''), 8);

    return {
      embeds: [
        {
          title: App.messages.reminderMessage,
          description: pings,
          color: color,
          fields: [
            {
              name: "Message:",
              value: confession
            }
          ],
          author: {
            name: "Jump to Confession",
            url: url
          }
        }
      ]
    }
  }
}