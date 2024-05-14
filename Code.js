function onFormSubmit(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();
  var range = sheet.getRange(lastRow, 8);

  // Assuming the text you want to add is "Submission Received"
  
  range.setValue("$B$" + lastRow);
}