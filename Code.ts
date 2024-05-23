/**
 * Converts a text-based heading into a column number to use with AppScript builtins
 * @param sheet The sheet to read the headings from
 * @param heading The heading to look for
 * @returns The column number to use to reference that heading
 */
function colFromHeading(
  sheet: GoogleAppsScript.Spreadsheet.Sheet,
  heading: string,
): number {
  const headerRange = sheet.getRange("1:1");
  const headerValues = headerRange.getValues()[0] ?? [];
  for (var i = 0; i < headerValues.length; i++) {
    if (headerValues[i] == heading) {
      return i + 1;
    }
  }

  return -1;
}

/**
 * Enables links to work properly in the confessions form by adding cell references to each submission when it comes in.
 * Also sends out messages to the webhook link to update #confessions-mods slack when a new post is made.
 * @param e The event data sent by the onFormSubmit trigger
 * @returns void
 */
function onFormSubmit(e: GoogleAppsScript.Events.SheetsOnFormSubmit) {
  // Get the form response sheet and get the bottommost row
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();

  // Try to get the number of the confession reference column
  let referenceCol = colFromHeading(sheet, "Confession Reference");
  if (referenceCol == -1) {
    console.log("Sheet Malformed - Reference column not found.");
    return;
  }

  // Write out the cell reference to the right cell.
  const referenceCell = sheet.getRange(lastRow, referenceCol);
  referenceCell.setValue("$B$" + lastRow);

  // Send a ping to #confessions-mods
  pingSlack();
}

/**
 * Copy a row from a source sheet to a target sheet and then remove that row.
 * @param source The name of the sheet to copy from
 * @param target The name of the sheet to copy to
 * @param row The row number to copy
 * @param colOffset The number of columns (from the righthand side) to exclude
 * @returns void
 */
function copyRowAndDeleteOriginal(
  sourceSheet: GoogleAppsScript.Spreadsheet.Sheet,
  targetSheet: GoogleAppsScript.Spreadsheet.Sheet,
  row: number,
  colOffset: number,
) {
  const sourceRange = sourceSheet.getRange(
    row,
    1,
    1,
    sourceSheet.getLastColumn() - colOffset,
  );
  const targetRange = targetSheet.getRange(targetSheet.getLastRow() + 1, 1);

  sourceRange.copyTo(targetRange);
  sourceSheet.deleteRow(row);
}

/**
 * Send a webhook message to the HKN slack
 * Requires that you set Webhook.url in the Webhook.ts file (template pushed to git without URL)
 * @returns void
 */
function pingSlack() {
  // Get row that new data is at
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();

  // Get columns that vals will be at
  const timestampCol = colFromHeading(sheet, "Timestamp");
  const confessionCol = colFromHeading(sheet, "Confession");
  const handleCol = colFromHeading(sheet, "Slack Handle");
  if (timestampCol == -1 || confessionCol == -1 || handleCol == -1) {
    console.log("Sheet Malformed");
    return;
  }

  // Get data
  const timestamp = Date.parse(sheet.getRange(lastRow, timestampCol).getValue());
  const confession = sheet.getRange(lastRow, confessionCol).getValue();
  const handle = sheet.getRange(lastRow, handleCol).getValue();

  // Assemble Payload
  var payload = {
    'text': ':alert: *A NEW CONFESSION HAS BEEN SUBMITTED - BEGIN DISCUSSION* :alert:', // Set the message text.
    'attachments': [ // Set the message attachments.
      {
        'color': '#36a64f',
        'mrkdwn_in': ['value'],
        'title': 'New Confession',
        'text': confession,
        'fields': [
          {
            'title': 'Send to:',
            'value': (handle != "" && handle != null) ? `@${handle}` : "<#C01A8FR2UMR>",
          },
        ],
        'footer': "gossipgirl",
        'footer_icon': "https://i.imghippo.com/files/lSU401716341582.jpg",
        'ts': timestamp,
      }
    ]
  };

  // Set up the options for the UrlFetchApp.fetch() method.
  var options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    'method': 'post',
    'payload': JSON.stringify(payload)
  };

  UrlFetchApp.fetch(Webhook.url, options)
}

/**
 * Archive all rows until the first non yes/no value
 * @returns void
 */
function archive() {
  const sourceSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1");
  const targetSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Archive");

  // Error if sheets don't exist
  if (sourceSheet == null || targetSheet == null) {
    console.log("Error - Sheet malformed.");
    return;
  }

  // Try to get the number of the post column
  let postedCol = colFromHeading(sourceSheet, "Posted?");
  if (postedCol == -1) {
    console.log("Sheet Malformed - Posted? column not found.");
    return;
  }

  // Loop through and remove all of the valid rows
  let value = sourceSheet.getRange(2, postedCol).getValue();
  while (sourceSheet.getLastRow() >= 2 && (value == "Yes" || value == "No")) {
    copyRowAndDeleteOriginal(sourceSheet, targetSheet, 2, 1);
    value = sourceSheet.getRange(2, postedCol).getValue();
  }

  // Update the references for all of the remaining rows
  repair();
}

/**
 * Loop through all rows in the range of the sheet and ensures the reference values are correct.
 * @returns void
 */
function repair() {
  // Get the form response sheet and get our last row
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Form Responses 1");
  if (sheet == null) {
    console.log("Error - Sheet malformed.");
    return;
  }
  const lastRow = sheet.getLastRow();

  // Try to get the number of the confession reference column
  let referenceCol = colFromHeading(sheet, "Confession Reference");
  if (referenceCol == -1) {
    console.log("Sheet Malformed - Reference column not found.");
    return;
  }

  // While our current row is within the bounds of our sheet, update the value:
  for (var row = 2; row <= lastRow; row++) {
    const referenceCell = sheet.getRange(row, referenceCol);
    referenceCell.setValue("$B$" + row);
  }
}

/**
 * Add an option to the extensions dropdown menu to trigger archive
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu("Confessions Helper")
    .addItem("Archive Confessions", "archive")
    .addItem("Repair References", "repair")
    .addToUi();
}
