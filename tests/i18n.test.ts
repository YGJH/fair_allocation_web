import {expect,test} from 'vitest';
import {copy,selectLocale,localePath} from '../src/i18n/locale';
import {adventureCopy} from '../src/i18n/adventure';
test('browser default, persistence and shared links', () => {
 expect(selectLocale('zh-TW,zh;q=.9',undefined)).toBe('zh-TW');
 expect(selectLocale('zh-CN,en;q=.8',undefined)).toBe('en');
 expect(selectLocale('en','zh-TW')).toBe('zh-TW');
 expect(localePath('en','/cases/123')).toBe('/en/cases/123');
 expect(Object.keys(copy.en).sort()).toEqual(Object.keys(copy['zh-TW']).sort());
 expect(adventureCopy.en.pauseMenu.recallArchive).toBe('Recall Archive');
 expect(adventureCopy['zh-TW'].pauseMenu.recallArchive).toBe('回憶檔案');
});
