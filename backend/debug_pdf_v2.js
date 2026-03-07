const pdf = require('pdf-parse');
console.log('Keys:', Object.keys(pdf));
for (const key of Object.keys(pdf)) {
    console.log(`Type of ${key}:`, typeof pdf[key]);
}
if (pdf.default) {
    console.log('Default type:', typeof pdf.default);
}
