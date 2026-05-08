/**
 * COPY THIS CODE TO YOUR GOOGLE APPS SCRIPT EDITOR
 * 1. Open your Google Sheet
 * 2. Click Extensions > Apps Script
 * 3. Paste this code and save
 * 4. Click 'Deploy' > 'New Deployment'
 * 5. Select 'Web App'
 * 6. Set 'Execute as' to 'Me' and 'Who has access' to 'Anyone'
 * 7. Copy the Web App URL and paste it into your App.tsx
 */

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0]; // Assumes data is in the first sheet
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const data = rows.slice(1);

  const formattedData = data.map(row => {
    let obj = {};
    headers.forEach((header, i) => {
      // Map sheet headers to our internal keys
      const key = mapHeaderToKey(header);
      obj[key] = row[i];
    });
    return obj;
  });

  return ContentService.createTextOutput(JSON.stringify(formattedData))
    .setMimeType(ContentService.MimeType.JSON);
}

function mapHeaderToKey(header) {
  const h = header.toLowerCase();
  if (h.includes('timestamp')) return 'timestamp';
  if (h.includes('email')) return 'email';
  if (h.includes('occasion')) return 'occasion';
  if (h.includes('package')) return 'package';
  if (h.includes('couple')) return 'coupleName';
  if (h.includes('venue') || h.includes('date')) return 'dateVenue';
  if (h.includes('instagram')) return 'instagram';
  if (h.includes('phone')) return 'phone';
  if (h.includes('proof')) return 'proofLink';
  if (h.includes('price') || h.includes('nominal')) return 'price';
  if (h.includes('dp') || h.includes('down payment')) return 'downPayment';
  return header.replace(/\s+/g, '_');
}
