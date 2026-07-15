/**
 * Moonlight Studio & Photography - Google Apps Script Backend Database
 * 
 * Instructions:
 * 1. Create a Google Sheet and name the active sheet tab/tab sheet "Reviews".
 * 2. In row 1 of the sheet, create these headers:
 *    A1: Timestamp | B1: Full Name | C1: Email | D1: Phone | E1: Event Type | F1: Rating | G1: Message | H1: Photo URL | I1: Status
 * 3. Open Extensions > Apps Script in Google Sheets.
 * 4. Replace any default code with this script.
 * 5. Click "Deploy" > "New Deployment".
 *    - Select type: "Web App"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone"
 * 6. Copy the Web App URL and paste it into c:\moonlight studio\app.js config.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Reviews");
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    }
    
    // File upload logic if image data is present
    var photoUrl = "";
    if (data.photoData && data.photoName) {
      var folder;
      var folders = DriveApp.getFoldersByName("Moonlight Reviews Photos");
      if (folders.hasNext()) {
        folder = folders.next();
      } else {
        folder = DriveApp.createFolder("Moonlight Reviews Photos");
      }
      
      var base64Data = data.photoData.split(",")[1] || data.photoData;
      var decoded = Utilities.base64Decode(base64Data);
      var blob = Utilities.newBlob(decoded, data.photoMimeType, data.photoName);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      photoUrl = file.getUrl();
    }
    
    // Append review details to sheet
    sheet.appendRow([
      new Date(),
      data.name,
      data.email,
      data.phone || "",
      data.eventType,
      data.rating,
      data.message,
      photoUrl,
      "Approved" // Saves with Approved status by default so it displays immediately
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Reviews");
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    }
    var rows = sheet.getDataRange().getValues();
    var reviews = [];
    
    // Skip row 0 (headers)
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var status = row[8] ? row[8].toString().trim() : "";
      
      if (status === "Approved") {
        reviews.push({
          timestamp: row[0],
          name: row[1],
          email: row[2],
          phone: row[3],
          eventType: row[4],
          rating: parseInt(row[5]) || 5,
          message: row[6],
          photoUrl: row[7] || ""
        });
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", reviews: reviews }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*');
  }
}

// Add Options CORS preflight support
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
}
