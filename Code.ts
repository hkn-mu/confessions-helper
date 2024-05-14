/**
 * Converts a text-based heading into a column number to use with AppScript builtins
 * @param sheet The sheet to read the headings from
 * @param heading The heading to look for
 * @returns The column number to use to reference that heading
 */
function colFromHeading(sheet: GoogleAppsScript.Spreadsheet.Sheet, heading: string): number {
  const headerRange = sheet.getRange('1:1');
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
 * @param e The event data sent by the onFormSubmit trigger
 * @returns void
 */
function onFormSubmit(e: GoogleAppsScript.Events.SheetsOnFormSubmit) {
  // Get the form response sheet and get the bottommost row
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const lastRow = sheet.getLastRow();

  // Try to get the number of the confession reference column
  let referenceCol = colFromHeading(sheet, "Confession Reference");
  if (referenceCol == -1) { console.log("Sheet Malformed - Reference column not found."); return; }

  // Write out the cell reference to the right cell.
  const referenceCell = sheet.getRange(lastRow, referenceCol);
  referenceCell.setValue("$B$" + lastRow);
}

/**
 * Copy a row from a source sheet to a target sheet and then remove that row.
 * @param source The name of the sheet to copy from
 * @param target The name of the sheet to copy to
 * @param row The row number to copy
 * @param colOffset The number of columns (from the righthand side) to exclude
 */
function copyRowAndDeleteOriginal(sourceSheet: GoogleAppsScript.Spreadsheet.Sheet, targetSheet: GoogleAppsScript.Spreadsheet.Sheet, row: number, colOffset: number) {
  const sourceRange = sourceSheet.getRange(row, 1, 1, sourceSheet.getLastColumn() - colOffset);
  const targetRange = targetSheet.getRange(targetSheet.getLastRow() + 1, 1);

  sourceRange.copyTo(targetRange);
  sourceSheet.deleteRow(row);
}

/**
 * Archive all rows until the first non yes/no value
 * @returns void
 */
function archive() {
  const sourceSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Form Responses 1');
  const targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Archive');

  // Error if sheets don't exist
  if (sourceSheet == null || targetSheet == null) {
    console.log("Error - Sheet malformed.")
    return;
  }


  // Try to get the number of the post column
  let postedCol = colFromHeading(sourceSheet, "Posted?");
  if (postedCol == -1) { console.log("Sheet Malformed - Posted? column not found."); return; }

  console.log(postedCol);

  // Loop through and remove all of the valid rows
  let value = sourceSheet.getRange(2, postedCol).getValue();
  console.log(value);
  while (sourceSheet.getLastRow() >= 2 && (value == "Yes" || value == "No")) {
    copyRowAndDeleteOriginal(sourceSheet, targetSheet, 2, 1);
    value = sourceSheet.getRange(2, postedCol).getValue();
    console.log(value);
  }
}

/**
 * Add an option to the extensions dropdown menu to trigger archive
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Confessions Helper')
    .addItem('Archive Confessions', 'archive')
    .addToUi();
}