# Confession Helper

A tool to make it easier to facilitate an anonymous confessions channel using Google Forms, Google Sheets, and any webhook-enabled messaging application!

## Features

- Automated "New Confession" notifications
- Confession moderation tools
- Post scheduling and day-of reminders
- An archive of old confessions and a tracker for to be discussed/scheduled ones.

## Prerequisites

Make sure that you have the following tools installed:

- [NodeJS](https://nodejs.org/en)
- [Typescript](https://www.typescriptlang.org/)
- [Clasp](https://github.com/google/clasp)

## How to set up

1. Create an anonymous Google Form with two short-answer boxes: A box for the confession, and a box for an optional tag for whom to send the message to
2. Clone the [Confessions Form Template](https://docs.google.com/spreadsheets/d/1iOUjEHgUtev7oGEWbTGJgpUQmCxBu9P6EKL25cDuW70/edit?usp=sharing), and attach form responses to this new sheet.
   > **Important**: You will need to make sure that you manually recreate the "Form Responses 1" sheet in the sheet added for your Form Responses. Once this is done, feel free to right click on the "Confession Reference" row and press "Hide."
3. Next, you will need to make an AppScript project in your sheet. Navigate to the "Extensions" menu in your sheet, and select `AppsScript`.
4. Once the AppScript editor tab opens, navigate to the Project Settings tab by pressing the gear in the sidebar on the left
5. Copy your "Script ID"
6. Now, clone this git repository into a directory. There should be no subfolders in the directory. Run `npm install` to install dependencies.
7. Next, run `clasp clone {your script id}`. This will initialize your clasp project in your local directory. Delete the `.js` file this pulls.
   > **Important**: If you have never worked with Clasp before, make sure that you run `clasp login` and sign in with the correct Google account **before** running clasp clone.
8. Now, rename AppTemplate.ts to App.ts, and uncomment the entire file.
9. Follow your platform-specific instructions for how to configure App.ts
10. Run `clasp push` to push the project back to the remote.
11. Finally, navigate to `Triggers` in the AppScript editor by clicking the alarm clock in the sidebar on the left. Add an "On Form Submit" trigger pointing to the `onFormSubmit` function, and add a daily timed trigger at your preferred time pointing to the `remindToPost` function. Your project is fully set up!

> [!WARNING]
> When adding triggers, you may get a warning from Google that this application has not been verified. Please only install and approve applications that you trust, this one included.

## Slack Setup

1. [create a slack app](https://api.slack.com/quickstart), add it to your workspace, and [add an incoming webhook](https://api.slack.com/messaging/webhooks) pointing at your moderation channel. this link should fill in the `webhookurl` variable in the configuration.

2. Right click on the public-facing confessions channel and copy a link to the channel. Paste it, and copy only the segment after the last `/`. This should be your `channelId`.

3. Fill in the list of moderator usernames in the `gossipGirls` variable,

4. Make any additional modifications to the formatting of the message or layout of the sheet as you see fit and return to the general setup guide.

## Discord Setup

> [!NOTE]
> Due to Discord API limitations, in order for targetted confessions to properly ping users in Discord, submissions must use Discord ID's (obtainable by right clicking with Developer Mode on). If usernames are used instead, the embed will feature `<@username>` instead of a ping.

1. Go to the `Integrations` tab of your server settings and add a webhook. Copy the link and paste it into the `webhookUrl` variable.

2. Right click on the public-facing confessions channel and click "Copy Channel ID". This should be your `channelId`.

   > **Note:** If this is your first time working with ID's, you will need to enable Discord Developer Mode in User Settings > Advanced > Developer Mode.

3. Copy the User ID's (by right clicking) of all moderators, and fill them into the `gossipGirls` variable.

4. **Convert the attachmentColor variable into an octet** by removing the quotes and hashtag, and adding `0x` in front of it (IE: `0x36A64F`)

5. Make any additional configuration changes as you see fit and return to the general setup guide!

## Contributing New Platforms

This codebase relies solely on webhooks to communicate with messaging platforms. If your platform of choice accepts JSON-based webhooks, it is likely that you can extend the codebase to accept your platform (If you do this, feel free to submit a PR!). In order to do this, you must make three changes:

1. Add a namespace that exports the following two functions (to get accepted as a PR, do this in its own file in `./platforms`):

   ```ts
   formatNewConfessionMessage: (confession: string, timestamp: number, date: Date, handle: string, url: string) => Object

   formatReminderMessage(pings: string, confession: string, url: string) => Object
   ```

2. Add your platform to the list of supported platforms in `Payload.ts`, and append the two functions to the two switch cases (in alpahbetical order).

3. Update the `README.md` with platform-specific instructions!

## How to use

Now that your project is set up, you can use it to keep track of and post confessions. Every time a user submits a confession, you will be notified in slack with a link to the confession in the sheet. From there, you can discuss the confession and elect to reject it, postpone discussion until later, or schedule it to be posted. Once a post date is provided and the "To be posted" option is selected, you will recieve a reminder on the day of to post the message in your moderation channel. You can use the different tabs in the spreadsheet to keep track of what has happened to non-archived data, and you can run the script that appears in the top menu of the sheet (under the `Confessions Helper` tab) in order to archive old posts when there are too many to keep track of (they will be moved to the Archive sheet).

## HKN Mu Specific Information

If you are a moderator for HKN-Mu's confessions channel who wishes to maintain or make changes to this script (or to the configuration file), you should be able to do so as long as you have access to the Google Sheet. Just go to the AppScript Editor and copy the ID, then clone the project like you would if setting it up. If you would like to make changes to the Slack Integration, the bot is owned by @jonahbedouch, and you can reach out to him or to anyone else with permission to get added to it. If you only modify the configuration file, you only need to push using clasp, but if you make changes to the project itself, make sure to push them to the GitHub! Happy moderating!
