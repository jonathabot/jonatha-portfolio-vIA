/**
 * Reference Apps Script Web App for the Jonatha Botelho v2 portfolio CMS.
 *
 * Deploy: Extensions → Apps Script → Deploy → New deployment → Web app
 *   Execute as: Me · Who has access: Anyone.
 * Copy the /exec URL into the site env var CMS_ENDPOINT_URL.
 * Set CMS_TOKEN in both the site env and TOKEN below to require ?token=.
 *
 * The site validates the returned JSON against lib/cms/schema.ts (Zod). The
 * exact contract is documented in
 * docs/superpowers/specs/2026-07-02-portfolio-v2-design.md → "Contrato JSON",
 * and content/fallback.json is a complete, valid example payload.
 *
 * Simplest supported approach: keep a single tab named "payload" with the full
 * JSON in cell A1 (edited via AppSheet), and return it verbatim. Swap
 * buildPayload_() for per-tab assembly once the AppSheet schema is built.
 */
var TOKEN = ''; // set to match the site's CMS_TOKEN, or leave '' to allow all

function doGet(e) {
  if (TOKEN && (!e || !e.parameter || e.parameter.token !== TOKEN)) {
    return json_({ error: 'unauthorized' });
  }
  try {
    return json_(buildPayload_());
  } catch (err) {
    return json_({ error: String(err) });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

/**
 * Minimal reference: read the whole contract from a "payload" tab, cell A1.
 * Replace with per-tab assembly (meta, hero, tools, experience, projects, …)
 * once the AppSheet-backed sheet structure is in place.
 */
function buildPayload_() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('payload');
  if (!sheet) throw new Error('Missing "payload" sheet');
  var raw = sheet.getRange('A1').getValue();
  return JSON.parse(raw);
}
