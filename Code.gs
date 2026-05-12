/**
 * Google Apps Script - Famo CRM Backend
 * 
 * INSTRUCTIONS:
 * 1. Open Google Sheets (sheets.google.com)
 * 2. Create a new Spreadsheet
 * 3. Extensions > Apps Script
 * 4. Paste this code into Code.gs
 * 5. Run 'setup' function once (select it from the dropdown and click Run)
 * 6. Deploy > New Deployment > Web App
 * 7. Execute as: Me
 * 8. Who has access: Anyone
 * 9. Copy the Web App URL and paste it into your application settings
 */

const SHEET_NAME = 'JobData';
const HEADERS = [
  'Timestamp', 
  'Email Address', 
  'Occasion', 
  'Package', 
  'Couple Name', 
  'Date & Venue', 
  'Instagram', 
  'Phone Number', 
  'Proof Link', 
  'Total Price', 
  'Down Payment',
  'Invoice ID',
  'Additional Notes',
  'Calendar Event ID'
];

/**
 * Initializes the spreadsheet with correct headers
 */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.setFrozenRows(1);
  
  // Apply formatting to headers
  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange.setBackground('#6d28d9') // Violet 700
    .setFontWeight('bold')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');
    
  Logger.log('Setup complete. Headers initialized.');
  return "Setup complete! Spreadsheet is ready.";
}

/**
 * Handles GET requests
 * If ?api=true is passed, returns JSON data
 * Otherwise returns the Index.html interface
 */
function doGet(e) {
  if (e && e.parameter && e.parameter.api) {
    return fetchAllData();
  }
  
  return HtmlService.createTemplateFromFile('Index')
      .evaluate()
      .setTitle('Famo CRM Dashboard')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Fetches all records from the spreadsheet
 */
function fetchAllData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    const range = sheet.getDataRange();
    const values = range.getValues();
    
    if (values.length <= 1) return createJsonResponse([]);
    
    const headers = values[0];
    const data = values.slice(1).map(row => {
      let obj = {};
      headers.forEach((header, i) => {
        const key = mapHeaderToKey(header);
        obj[key] = row[i];
      });
      return obj;
    });
    
    return createJsonResponse(data);
  } catch (e) {
    return createJsonResponse({ error: e.toString() });
  }
}

/**
 * Handles POST requests to save/update data and sync to Calendar
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.getSheets()[0];
    const payload = JSON.parse(e.postData.contents);
    
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    
    // Find unique row index
    let rowIndex = -1;
    let existingCalendarId = '';
    
    // Ensure "Calendar Event ID" column exists 
    let calendarColIndex = headers.indexOf('Calendar Event ID');
    if (calendarColIndex === -1) {
      calendarColIndex = headers.length;
      sheet.getRange(1, calendarColIndex + 1).setValue('Calendar Event ID');
      headers.push('Calendar Event ID');
    }

    const emailColIndex = headers.indexOf('Email Address');
    const coupleColIndex = headers.indexOf('Couple Name');
    const tsColIndex = headers.indexOf('Timestamp');

    for (let i = 1; i < rows.length; i++) {
      const emailInSheet = emailColIndex !== -1 ? rows[i][emailColIndex] : '';
      const coupleInSheet = coupleColIndex !== -1 ? rows[i][coupleColIndex] : '';
      const timestampInSheet = tsColIndex !== -1 ? rows[i][tsColIndex] : '';
      
      if (payload.timestamp && payload.timestamp == timestampInSheet) {
        rowIndex = i + 1;
        existingCalendarId = rows[i][calendarColIndex] || '';
        break;
      }
      if (payload.coupleName == coupleInSheet && payload.email == emailInSheet) {
        rowIndex = i + 1;
        existingCalendarId = rows[i][calendarColIndex] || '';
        break;
      }
    }

    // Sync to Google Calendar
    let calendarEventId = existingCalendarId || payload.calendarEventId;
    if (payload.dateVenue) {
      calendarEventId = syncToCalendar(payload, calendarEventId, payload.targetCalendarId);
      payload.calendarEventId = calendarEventId;
    }
    
    // Prepare row data
    const rowData = HEADERS.map(h => {
      const key = mapHeaderToKey(h);
      return payload[key] !== undefined ? payload[key] : '';
    });
    
    if (rowIndex > 0) {
      sheet.getRange(rowIndex, 1, 1, HEADERS.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    
    return createJsonResponse({ 
      success: true, 
      message: 'Data saved successfully',
      calendarEventId: calendarEventId 
    });
  } catch (e) {
    return createJsonResponse({ success: false, error: e.toString() });
  }
}

/**
 * Sync to Calendar helper
 */
function syncToCalendar(booking, existingEventId, targetCalendarId) {
  try {
    const calendarId = targetCalendarId || 'primary';
    let calendar = calendarId === 'primary' ? CalendarApp.getDefaultCalendar() : CalendarApp.getCalendarById(calendarId);
    
    if (!calendar) return existingEventId || '';

    // Extract date and venue from "DD/MM/YYYY @ Venue" or "DD Month YYYY | Venue"
    const separators = ['@', '|', '-'];
    let parts = [booking.dateVenue || ''];
    for (const sep of separators) {
      if (booking.dateVenue.includes(sep)) {
        parts = booking.dateVenue.split(sep);
        break;
      }
    }
    
    const dateStr = parts[0].trim();
    const venue = parts[1] ? parts[1].trim() : '';

    const eventDate = parseFlexibleDate(dateStr);
    if (!eventDate) return existingEventId || '';

    const title = `[Famo] ${booking.coupleName} - ${booking.occasion}`;
    const description = `
Package: ${booking.package}
Couple: ${booking.coupleName}
Email: ${booking.email}
Phone: ${booking.phone || 'N/A'}
Venue: ${venue || 'N/A'}
Notes: ${booking.additional || 'None'}
    `.trim();

    let event;
    if (existingEventId) {
      try { event = calendar.getEventById(existingEventId); } catch (e) {}
    }

    if (event) {
      event.setTitle(title).setDescription(description).setAllDayDate(eventDate).setLocation(venue);
    } else {
      event = calendar.createAllDayEvent(title, eventDate, { 
        description: description,
        location: venue
      });
    }

    return event.getId();
  } catch (e) {
    return existingEventId || '';
  }
}

function parseFlexibleDate(dateStr) {
  const months = {
    'januari': 0, 'februari': 1, 'maret': 2, 'april': 3, 'mei': 4, 'juni': 5,
    'juli': 6, 'agustus': 7, 'september': 8, 'oktober': 9, 'november': 10, 'desember': 11,
    'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'mei': 4, 'jun': 5,
    'jul': 6, 'agu': 7, 'sep': 8, 'okt': 9, 'nov': 10, 'des': 11,
    'january': 0, 'february': 1, 'march': 2, 'may': 4, 'june': 5, 'july': 6, 'august': 7, 'december': 11
  };
  
  // Try DD/MM/YYYY
  const slashMatch = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (slashMatch) {
    return new Date(parseInt(slashMatch[3]), parseInt(slashMatch[2]) - 1, parseInt(slashMatch[1]));
  }
  
  // Try DD Month YYYY (e.g. 26 Mei 2026 or 26 May 2026)
  const spaceMatch = dateStr.match(/(\d{1,2})\s+([a-zA-Z]+)\s+(\d{4})/);
  if (spaceMatch) {
    const day = parseInt(spaceMatch[1]);
    const monthName = spaceMatch[2].toLowerCase();
    const year = parseInt(spaceMatch[3]);
    
    let month = months[monthName];
    if (month !== undefined) {
      return new Date(year, month, day);
    }
  }
  
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
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
  if (h.includes('price')) return 'price';
  if (h.includes('dp') || h.includes('down payment')) return 'downPayment';
  if (h.includes('invoice') || h.includes('id')) return 'id';
  if (h.includes('additional') || h.includes('notes')) return 'additional';
  return header.replace(/\s+/g, '_');
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
