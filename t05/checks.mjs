import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {exportCsv} from '../lib/csv.mjs';
const row={record_date:'2026-10-01',normalized_value:16.5,unit:'°C',source_name:'서울 기온',source_url:'https://example.invalid/weather',source_time:'2026-10-01T00:00:00Z',fetched_at:'2026-10-01T01:00:00Z',record_timezone:'Asia/Seoul'};
const out=(patch={},mode='live')=>exportCsv([{...row,...patch}],mode);
const tests=[
()=>assert.deepEqual(exportCsv([],'live'),{filename:null,content:null,message:'내려받을 기록이 없어요.'}),
()=>assert.equal(out().content,'\uFEFF데이터 종류,KST 조회 날짜,저장값,단위,출처,출처 URL,출처 시각,조회 시각,기준 시간대\r\n실제,2026-10-01,16.5,°C,서울 기온,https://example.invalid/weather,2026-10-01T00:00:00Z,2026-10-01T01:00:00Z,Asia/Seoul\r\n'),
()=>{assert.equal(out().content.charCodeAt(0),0xfeff);assert.ok(out().content.includes('서울 기온'));},
()=>assert.ok(out({source_name:'서울,기온'}).content.includes(',"서울,기온",')),
()=>assert.ok(out({source_name:'서울 "기온"'}).content.includes(',"서울 ""기온""",')),
()=>assert.ok(out({source_name:'서울\n기온'}).content.includes(',"서울\n기온",')),
()=>assert.ok(out({source_time:null,normalized_value:0}).content.includes('실제,2026-10-01,0,°C,서울 기온,https://example.invalid/weather,,2026-10-01T01:00:00Z,Asia/Seoul')),
()=>{const rows=[{...row,record_date:'2026-10-02',normalized_value:-2.75},row];const before=JSON.stringify(rows);const c=exportCsv(rows,'live').content;assert.ok(c.indexOf('2026-10-01')<c.indexOf('2026-10-02'));assert.ok(c.includes('2026-10-02,-2.75,'));assert.equal(JSON.stringify(rows),before);},
()=>{assert.equal(out().filename,'seoul-daily-live.csv');assert.equal(out({},'test').filename,'seoul-daily-test.csv');assert.ok(out().content.includes('\r\n실제,'));assert.ok(out({},'test').content.includes('\r\n합성,'));},
()=>assert.ok(out({source_name:'=1+1'}).content.includes(", '=1+1,".replace(', ',',')))
];
const frozen=JSON.parse(readFileSync(new URL('./frozen.json',import.meta.url)));
assert.equal(frozen.tests.length,10);assert.equal(tests.length,10);
let fail=0;const results=tests.map((fn,i)=>{try{fn();return {id:frozen.tests[i].id,status:'PASS'};}catch(e){fail++;return {id:frozen.tests[i].id,status:'FAIL',error:e.message};}});
console.log(JSON.stringify({executed_at:new Date().toISOString(),passed:10-fail,total:10,results},null,2));process.exitCode=fail?1:0;
