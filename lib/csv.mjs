const headers=['데이터 종류','KST 조회 날짜','저장값','단위','출처','출처 URL','출처 시각','조회 시각','기준 시간대'];
function cell(value, protect=false){
 let s=value==null?'':String(value);
 if(protect&&/^[\s]*[=+\-@]/.test(s))s="'"+s;
 return /[",\r\n]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;
}
export function exportCsv(rows,mode){
 if(mode!=='live'&&mode!=='test')throw Error('잘못된 데이터 종류');
 if(!rows.length)return {filename:null,content:null,message:'내려받을 기록이 없어요.'};
 const lines=[headers.map(v=>cell(v)).join(',')];
 for(const r of [...rows].sort((a,b)=>a.record_date.localeCompare(b.record_date))){
 const fields=[mode==='live'?'실제':'합성',r.record_date,r.normalized_value,r.unit,r.source_name,r.source_url,r.source_time,r.fetched_at,r.record_timezone];
 lines.push(fields.map((v,i)=>cell(v,i!==2)).join(','));
 }
 return {filename:`seoul-daily-${mode}.csv`,content:'\uFEFF'+lines.join('\r\n')+'\r\n',message:`${rows.length}건의 기록을 내려받아요.`};
}
