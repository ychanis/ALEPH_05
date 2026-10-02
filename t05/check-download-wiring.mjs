// A 후속 검증: 브라우저 실기 대신 다운로드 함수의 DOM 동작 검증.
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {exportCsv} from '../lib/csv.mjs';
const source=readFileSync(new URL('../app/page.tsx',import.meta.url),'utf8');
const fn=source.slice(source.indexOf(' function handleDownloadCsv(){'),source.indexOf(' return <main>'));
const rows=[{record_date:'2026-10-01',normalized_value:16.5,unit:'°C',source_name:'서울 기온',source_url:'https://example.invalid',source_time:null,fetched_at:'2026-10-01T00:00:00Z',record_timezone:'Asia/Seoul'}];
const results=[];
for(const mode of ['live','test']){
 let clicked=0,added=0,removed=0,revoked=0,blob,filename,message;
 const context={state:{rows},mode,exportCsv,Blob,setCsvMessage:m=>message=m,URL:{createObjectURL:b=>{blob=b;return 'blob:test';},revokeObjectURL:u=>{assert.equal(u,'blob:test');revoked++;}},document:{createElement:()=>({setAttribute:(k,v)=>{assert.equal(k,'download');filename=v;},click:()=>clicked++}),body:{appendChild:()=>added++,removeChild:()=>removed++}}};
 vm.runInNewContext(fn+';handleDownloadCsv();',context);
 assert.equal(filename,`seoul-daily-${mode}.csv`);assert.equal(clicked,1);assert.equal(added,1);assert.equal(removed,1);assert.equal(revoked,1);assert.equal(blob.type,'text/csv;charset=utf-8;');assert.deepEqual(new Uint8Array(await blob.arrayBuffer()),new TextEncoder().encode(exportCsv(rows,mode).content));assert.ok(message);results.push({case:mode,status:'PASS'});
}
let message;
vm.runInNewContext(fn+';handleDownloadCsv();',{state:{rows:[]},mode:'live',exportCsv,setCsvMessage:m=>message=m});
assert.equal(message,'내려받을 기록이 없어요.');results.push({case:'empty',status:'PASS'});
console.log(JSON.stringify({by:'AI A follow-up',scope:'DOM mocks; real browser download and full build not verified',results},null,2));
