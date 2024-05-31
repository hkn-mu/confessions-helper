// /**
//  * A template for the configuration object for confession-helper.
//  */
// namespace App {
//     /** A supported messaging platform to use - currently Discord or Slack */
//     export const platform: Payload.SupportedPlatform = "Slack"
//     /** The URL provided by slack that lets the script send messages to a moderation channel */
//     export const webhookUrl: string = "";
//     /** The name of the spreadsheet where form responses end up after posting */
//     export const datasheetName: string = "Form Responses 1";
//     /** The name of the sheet where archived data should end up */
//     export const archiveName: string = "Archive";
//     /** The ID of the channel where your confessions go */
//     export const channelId: string = "";
//     /** The color of the attachment in the message */
//     export const attachmentColor: string = "#36A64F";
//     /** A list of slack usernames to ping in reminders  */
//     export const gossipGirls: string[] = []
//     /** A mapping of column names to spreadsheet headings */
//     export const columnNames = {
//      /** The column containing the timestamp of the form submission */
//      timestamp: "Timestamp",
//      /** The column containing the confession message */
//      confession: "Confession",
//      /** The column containing the slack handle to send to */
//      handle: "Slack Handle",
//      /** The column containing the current posted state */
//      posted: "Posted?",
//      /** The column containing the post number [if the confession has been posted] */
//      postNum: "Post #",
//      /** The column containing the date the post was made / the date the post is scheduled for */
//      postDate: "Post Date",
//      /** The column containing any notes that moderators have made about the confession */
//      notes: "Notes",
//      /** The column that this script will place a reference to the confessoin for the query() functionality [should be hidden on the form] */
//      reference: "Confession Reference"
//     }
//     /** A mapping of necessary messages to their content */
//     export const messages = {
//         /** The message to display above a new confession notification */
//         newConfession: "*A NEW CONFESSION HAS BEEN SUBMITTED!*",
//         /** The message to display above a time to post reminder */
//         reminderMessage: "*IT'S TIME TO POST A CONFESSION!*",
//         /** A prefix to append to the second line of a time to post reminder */
//         reminderPingPrefix: ":arrow_forward: ",
//         /** A postfix to append to the second line of a time to post reminder */
//         reminderPingPostfix: ""
//     }
// }
