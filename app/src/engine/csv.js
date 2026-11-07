export const REGISTER_COLUMNS=["reg_no","name","phone","pathway","step_no","last_visit_date"];
export function parseRegisterCsv(text) {
 if(text.length>1_000_000)throw new Error("The CSV is too large. Use a file below 1 MB.");
 const records=[];let row=[],field="",quoted=false;
 const value=text.replace(/^\uFEFF/,"");
 for(let i=0;i<value.length;i++){
  const c=value[i];
  if(c==='"'){if(quoted&&value[i+1]==='"'){field+='"';i++;}else if(!quoted&&field.trim()){throw new Error("Unexpected quote in a CSV field.");}else quoted=!quoted;}
  else if(c===","&&!quoted){row.push(field);field="";}
  else if((c==="\n"||c==="\r")&&!quoted){if(c==="\r"&&value[i+1]==="\n")i++;row.push(field);if(row.some(v=>v.trim()))records.push(row);row=[];field="";}
  else field+=c;
 }
 if(quoted)throw new Error("A quoted field is not closed.");
 row.push(field);if(row.some(v=>v.trim()))records.push(row);
 if(records.length<2)throw new Error("Add a header and at least one fictional patient row.");
 const header=records.shift().map(s=>s.trim().toLowerCase());
 if(header.length!==6||new Set(header).size!==6||REGISTER_COLUMNS.some(c=>!header.includes(c)))throw new Error("Use exactly these six columns: "+REGISTER_COLUMNS.join(","));
 if(records.length>1000)throw new Error("Import up to 1,000 fictional rows at a time.");
 const read=(r,k)=>r[header.indexOf(k)].trim();
 const seen=new Set();
 return records.map((r,i)=>{
  if(r.length!==header.length)throw new Error("Row "+(i+2)+" has a different number of fields.");
  const fields={regNo:read(r,"reg_no"),name:read(r,"name"),phone:read(r,"phone"),pathwayId:read(r,"pathway"),step:read(r,"step_no"),date:read(r,"last_visit_date")};
  if(seen.has(fields.regNo))throw new Error("Duplicate registration number on row "+(i+2)+".");
  seen.add(fields.regNo);
  return{id:"csv"+Date.now()+"-"+i,written:null,ocr:fields,fields,conf:{},confirmed:{},status:"pending",source:"CSV export"};
 });
}
