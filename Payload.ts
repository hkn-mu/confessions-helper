namespace Payload {
  export type SupportedPlatform = 'Slack' | 'Discord';
  export function formatNewConfessionMessage(confession: string, timestamp: number, date: Date, handle: string, url: string) {
    switch (App.platform) {
      case 'Discord':
        return Discord.formatNewConfessionMessage(confession, timestamp, date, handle, url);
      case 'Slack':
        return Slack.formatNewConfessionMessage(confession, timestamp, date, handle, url);
      default:
        return {}
    }
  }
  export function formatReminderMessage(pings: string, confession: string, url: string) {
    switch (App.platform) {
      case 'Discord':
        return Discord.formatReminderMessage(pings, confession, url);
      case 'Slack':
        return Slack.formatReminderMessage(pings, confession, url);
      default:
        return {}
    }
  }
}