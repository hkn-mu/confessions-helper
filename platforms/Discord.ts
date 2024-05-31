namespace Discord {
  export function formatNewConfessionMessage(confession: string, timestamp: number, date: Date, handle: string, url: string) {
    return {
      embeds: [
        {
          title: App.messages.newConfession,
          timestamp: date.toISOString(),
          color: App.attachmentColor,
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

  export function formatReminderMessage(pings: string, confession: string, url: string) {
    return {
      embeds: [
        {
          title: App.messages.reminderMessage,
          description: pings,
          color: App.attachmentColor,
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