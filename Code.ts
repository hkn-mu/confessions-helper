/**
 * Gets references for headings as specified in the App config 
 * @param sheet The spreadsheet to read headings from
 * @returns An object containing references to each heading row, or null if a heading is not present
 */
function getColumnRefs(
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): ColumnRef | null {
  let columnNames = { ...App.columnNames };
  const columns: Partial<ColumnRef> = {};
  const headerRange = sheet.getRange("1:1");
  const headerValues = headerRange.getValues()[0] ?? [];
  for (var i = 0; i < headerValues.length; i++) {
    for (const column in columnNames) {
      if (headerValues[i] === App.columnNames[column]) {
        columns[column] = i + 1;
        delete columnNames[column];
        break;
      }
    }
  }

  // We pop every column as it comes up, so if there are any left
  // we know that this is not a complete ColumnRef
  if (Object.keys(columnNames).length !== 0) {
    return null;
  }

  return columns as ColumnRef;
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

  // Try to get header references
  let columnRefs = getColumnRefs(sheet);
  if (columnRefs === null) {
    console.log("Sheet Malformed - Missing header columns.");
    return;
  }

  // Write out the cell reference to the right cell.
  const referenceCell = sheet.getRange(lastRow, columnRefs.reference);
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
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = spreadsheet.getActiveSheet();
  const lastRow = sheet.getLastRow();

  // Get columns that vals will be at
  let columnRefs = getColumnRefs(sheet);
  if (columnRefs === null) {
    console.log("Sheet Malformed - Missing header columns.");
    return;
  }

  // Get data
  const timestamp = Date.parse(sheet.getRange(lastRow, columnRefs.timestamp).getValue());
  const date = new Date(timestamp);
  const confession = sheet.getRange(lastRow, columnRefs.confession).getValue();
  const handle = String(sheet.getRange(lastRow, columnRefs.handle).getValue()) ?? '';
  const url = spreadsheet.getUrl() + "#gid=" + sheet.getSheetId() + "&range=" + sheet.getRange(lastRow, columnRefs.confession).getA1Notation();

  // Assemble our payload
  const payload = Payload.formatNewConfessionMessage(confession, timestamp, date, handle, url);

  // Set up the options for the UrlFetchApp.fetch() method.
  var options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
    'method': 'post',
    'contentType': 'application/json',
    'payload': JSON.stringify(payload)
  };

  UrlFetchApp.fetch(App.webhookUrl, options)
}

/**
 * Check to see if any posts are scheduled for today and send notifications for any of them that are
 * @param event The event recieved from the AppScript time trigger
 */
function remindToPost(event: GoogleAppsScript.Events.TimeDriven) {
  const spreadsheet = SpreadsheetApp.getActive();
  const sheet = spreadsheet.getSheetByName(App.datasheetName);

  // Error if sheet doesn't exist
  if (sheet === null) {
    console.log("Error - Sheet malformed.");
    return;
  }

  // Get our references to use below
  const columnRefs = getColumnRefs(sheet);
  if (columnRefs === null) {
    console.log("Error - Headers malformed.");
    return;
  }

  // Get relevant data using a filter
  const data = sheet.getDataRange().getValues().filter((row) => {
    // We use a try-catch so that we can just pretend like all of our data
    // is not malformed, and if it is it'll self-select as excluded
    try {
      const posted: string = row[columnRefs.posted - 1]
      const postDate: Date | "" = row[columnRefs.postDate - 1];
      const now: Date = new Date();

      // Ensure that we only get "To be posted" confessions that have a post date of today.
      return posted === "To be posted" && postDate !== "" && postDate.setHours(0, 0, 0, 0) == now.setHours(0, 0, 0, 0);
    }
    catch (error) {
      return false;
    }
  })

  // Get max confession number
  let confessionNum = Math.max(0, ...sheet.getRange(2, columnRefs.postNum, sheet.getLastRow(), 1).getValues().flat().filter(parseInt).filter(val => !isNaN(val)));

  for (const entry of data) {
    // Again, we use a try-catch to just ignore malformed rows
    try {
      // Increment our confession number so that it's accurate
      confessionNum++;

      // Put together our confession string
      const confession: string = entry[columnRefs.confession - 1];
      const confessionString = `${confessionNum}. ${confession}`
      const pings = App.messages.reminderPingPrefix + App.gossipGirls.map(usr => `<@${usr}>`).join(' ') + App.messages.reminderPingPostfix;
      const reference: string = entry[columnRefs.reference - 1];
      const url = spreadsheet.getUrl() + "#gid=" + sheet.getSheetId() + "&range=" + reference.replace(/\$/g, "");

      // Assemble our payload
      const payload = Payload.formatReminderMessage(pings, confessionString, url);

      // Set up the options for the UrlFetchApp.fetch() method.
      var options: GoogleAppsScript.URL_Fetch.URLFetchRequestOptions = {
        'method': 'post',
        'contentType': 'application/json',
        'payload': JSON.stringify(payload)
      };

      UrlFetchApp.fetch(App.webhookUrl, options)
    } catch {
      continue;
    }
  }

}

/**
 * Archive all rows until the first non yes/no value
 * @returns void
 */
function archive() {
  const sourceSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(App.datasheetName);
  const targetSheet =
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName(App.archiveName);

  // Error if sheets don't exist
  if (sourceSheet == null || targetSheet == null) {
    console.log("Error - Sheet malformed.");
    return;
  }

  // Get columns that vals will be at
  let columnRefs = getColumnRefs(sourceSheet);
  if (columnRefs === null) {
    console.log("Sheet Malformed - Missing header columns.");
    return;
  }

  // Get the max confession to make sure we don't remove it - will break reminder pings if we do.
  const maxConfession = Math.max(0, ...sourceSheet.getRange(2, columnRefs.postNum, sourceSheet.getLastRow(), 1).getValues().flat().filter(parseInt).filter(val => !isNaN(val)));

  // Get all values from row 2 to the last row at once
  let values = sourceSheet.getRange(2, columnRefs.posted, sourceSheet.getLastRow(), 1).getValues();

  // So long as there is a resolved row 2 that is not the most recently posted, copy it over and loop.
  while (values.length > 0 && values[0].length > (columnRefs.posted - 1) && values[0].length > (columnRefs.postNum - 1) &&
    (values[0][columnRefs.posted - 1] == "Yes" || values[0][columnRefs.posted - 1] == "No") && parseInt(values[0][columnRefs.postNum - 1]) < maxConfession) {
    copyRowAndDeleteOriginal(sourceSheet, targetSheet, 2, 1);
    values.shift();
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

  // Get columns that vals will be at
  let columnRefs = getColumnRefs(sheet);
  if (columnRefs === null) {
    console.log("Sheet Malformed - Missing header columns.");
    return;
  }

  // While our current row is within the bounds of our sheet, update the value:
  for (var row = 2; row <= lastRow; row++) {
    const referenceCell = sheet.getRange(row, columnRefs.reference);
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

// Type for smart column fetch
type ColumnRef = { [key in keyof typeof App.columnNames]: number };

// Typeguard for max confession number filter
function isNumber(argument: any): argument is number {
  return typeof argument === "number";
}