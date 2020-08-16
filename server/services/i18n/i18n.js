/* eslint-disable no-param-reassign */
const fs = require('fs');
const path = require('path');
const { supportedLanguages, defaultLanguage } = require('../../../config/config');

const portuguese = JSON.parse(fs.readFileSync(path.resolve(__dirname, './i18n-pt.json'), 'utf8'));
const english = JSON.parse(fs.readFileSync(path.resolve(__dirname, './i18n-en.json'), 'utf8'));

const langCodeMap = {};
supportedLanguages.forEach((langCode) => {
  langCodeMap[langCode] = langCode.includes('pt') ? portuguese : english;
});


function setLanguage(session, language) {
  const langToSet = language in langCodeMap ? language : defaultLanguage;
  session.lang = langToSet;
}

function getLanguage(session, locale = 'en-US') {
  const langToUse = 'lang' in session ? session.lang : locale;
  return { lang: langCodeMap[langToUse] };
}

module.exports = { setLanguage, getLanguage };
