/**
 * Platform-dependent Message Formatting
 */
namespace Payload {
  export type SupportedPlatform = 'Slack' | 'Discord';
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
    // Run the correct formatter based on the configuration
    switch (App.platform) {
      case 'Discord':
        return Discord.formatNewConfessionMessage(confession, timestamp, date, handle, url);
      case 'Slack':
        return Slack.formatNewConfessionMessage(confession, timestamp, date, handle, url);
      default:
        return {}
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
    // Run the correct formatter based on the configuration
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