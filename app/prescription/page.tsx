"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/useAuth";
import StaffNavbar from "@/components/StaffNavbar";

interface Medicine { id: number; name: string; }
interface Token {
  id: number; token_number: number; patient_name: string; age: number; sex: string;
  known_allergies: string; chief_complaints: string; filled_by_reception: boolean;
  filled_by_doctor: boolean; clinical_findings: string; diagnosis: string;
  treatment: string; medication: string; physiotherapy: string;
  follow_up: string; next_visit: string; date: string;
}

const CHIEF_COMPLAINTS = [
  "Chest-LT","Chest-RT","Shoulder-LT","Shoulder-RT","Elbow-LT","Elbow-RT",
  "Hand-LT","Hand-RT","Knee Joint-LT","Knee Joint-RT","Hip Joints-LT","Hip Joints-RT",
  "Foot-LT","Foot-RT","Heel-LT","Heel-RT","Ankle Joints-LT","Ankle Joints-RT",
  "Cervical Spine","Thoracic Spine","Lumbosacral Spine","Coccyx",
];

const CLINICAL_CONDITIONS: { category: string; items: string[] }[] = [
  { category: "Trauma", items: ["Soft Tissue","Bony"] },
  { category: "Fracture", items: ["Fracture"] },
  { category: "Infection", items: ["Tuberculous","Bacterial","Fungal"] },
  { category: "Inflammatory Arthritis", items: ["Gout","Rheumatoid Arthritis","Ankylosing Spondylitis","Seronegative Arthritis"] },
  { category: "Degenerative Disc Disease", items: ["Spondylosis - Lumbar","Spondylosis - Cervical"] },
  { category: "Prolapsed IVD", items: ["Cervical","Lumbar"] },
  { category: "Nerve Disorders", items: ["Carpal Tunnel Syndrome","Cubital Tunnel Syndrome","Tarsal Tunnel Syndrome","Peripheral Neuropathy","Nerve Palsy"] },
];

const COMORBIDITIES = ["HTN","DM","B.A.","Thyroid","Cardiac","Renal","Prev. Surgery"];
const NUTRITIONAL = ["Obese","Normal","Malnourished"];
const PHYSIOTHERAPY = [
  "ROM / RC Strengthening Exercise for Shoulder","Quads / VMO Strengthening Knee",
  "Knee ACL Rehab","Back Rehab","Neck Rehab","IFT / SWD","TENS","Post Op ROM Exercise",
];
const INSTRUCTIONS = ["Do not sit on Floor","Use Commode Chair","Decrease Climbing Stairs"];
const FOLLOW_UP_DAYS = ["5","10","20"];

const toggle = (arr: string[], val: string) =>
  arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
const parseArr = (str: string | null | undefined): string[] =>
  str ? str.split(",").map(s => s.trim()).filter(Boolean) : [];

const inp: React.CSSProperties = {
  width:"100%", padding:"10px 14px", borderRadius:"8px",
  border:"1.5px solid #e0e7ff", fontSize:"15px",
  fontFamily:"Georgia, serif", boxSizing:"border-box", outline:"none", background:"white",
};
const cb: React.CSSProperties = {
  width:"16px", height:"16px", marginRight:"6px", accentColor:"#0a2463", flexShrink:0,
};

function buildPrintHTML(pt: Token): string {
  const C = "#0a2463";
  const ptChief    = parseArr(pt.chief_complaints).filter(c => CHIEF_COMPLAINTS.includes(c));
  const ptNutri    = parseArr(pt.chief_complaints).filter(c => NUTRITIONAL.includes(c));
  const ptComor    = parseArr(pt.chief_complaints).filter(c => COMORBIDITIES.includes(c));
  const ptCfLines  = (pt.clinical_findings || "").split("\n");
  const ptConds    = ptCfLines[0] || "";
  const ptFindings = ptCfLines.slice(1).join(" ");
  const ptMeds     = (pt.medication || "").split("\n").filter(Boolean);
  const ptFollowup = (pt.follow_up || "").replace(" days","");
  const ptInstr    = parseArr(pt.treatment);
  const ptPhysio   = parseArr(pt.physiotherapy);
  const nextVisitStr = pt.next_visit
    ? new Date(pt.next_visit).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})
    : "";
  const nabh = `${window.location.origin}/nabh.jpeg`;

  const pcheck = (checked: boolean) =>
    `<span style="display:inline-block;width:10px;height:10px;border:1.5px solid ${C};margin-right:3px;text-align:center;font-size:7px;line-height:10px;vertical-align:middle;background:${checked?C:"#fff"};color:#fff;">${checked?"✓":""}</span>`;

  const complaintGrid = CHIEF_COMPLAINTS.map(c =>
    `<div style="font-size:10.5px;display:flex;align-items:center;gap:2px;margin-bottom:1px;">${pcheck(ptChief.includes(c))}${c}</div>`
  ).join("");

  const medRows = ptMeds.length > 0
    ? ptMeds.map(med => {
        const parts = med.split("|").map(s => s.trim());
        return `<tr>
          <td style="padding:2px 4px;border-bottom:1px solid #ccc;font-size:10.5px;">${parts[0]||""}</td>
          <td style="padding:2px 4px;border-bottom:1px solid #ccc;font-size:10.5px;">${parts[1]||"—"}</td>
          <td style="padding:2px 4px;border-bottom:1px solid #ccc;font-size:10.5px;">${parts[2]||"—"}</td>
          <td style="padding:2px 4px;border-bottom:1px solid #ccc;font-size:10.5px;"></td>
        </tr>`;
      }).join("")
    : `<tr><td colspan="4" style="height:18px;border-bottom:1px solid ${C};"></td></tr>`;

  const instrRows = INSTRUCTIONS.map(ins =>
    `<div style="display:flex;align-items:baseline;margin-bottom:3px;gap:4px;font-size:11px;">
      <span style="font-weight:bold;white-space:nowrap;">${ins}</span>
      <span style="flex:1;border-bottom:1px solid ${C};">&nbsp;${ptInstr.includes(ins)?"✓  Advised":""}</span>
    </div>`
  ).join("");

  const followupChecks = FOLLOW_UP_DAYS.map(f =>
    `<span style="margin-right:14px;">${pcheck(ptFollowup===f)}${f} days</span>`
  ).join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Prescription - ${pt.patient_name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; color: ${C}; }
    @page { margin: 8mm 10mm; size: A4 portrait; }
    html, body { width: 100%; height: auto; overflow: visible; }
    body { font-family: Arial, sans-serif; font-size: 11px; line-height: 1.35; background: #fff; }
    hr { border: none; border-top: 1px solid ${C}; margin: 3px 0; }
    table.meds { width: 100%; border-collapse: collapse; margin-bottom: 3px; }
    table.meds th { border-bottom: 1.5px solid ${C}; padding: 2px 4px; text-align: left; font-size: 10.5px; font-weight: bold; }
    .cgrid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0px 4px; margin: 2px 0 3px; margin-left: 12px; }
    .footer-wrap { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 8px; border-top: 1.5px solid ${C}; padding-top: 4px; gap: 4px; }
    .fcol { font-size: 8.5px; flex: 1; min-width: 0; }
    .fcol .hn { font-weight: bold; font-size: 9px; margin-bottom: 1px; }
    .sig { text-align: right; font-weight: bold; font-size: 11px; align-self: flex-end; border-top: 1px solid ${C}; padding-top: 3px; white-space: nowrap; min-width: 100px; flex-shrink: 0; }
  </style>
</head>
<body>
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px;">
  <div>
    <div style="font-family:Georgia,serif;font-style:italic;font-size:22px;font-weight:bold;">Dr. G.K. Boob</div>
    <div style="font-size:10px;line-height:1.5;">DNB (Ortho.), Mumbai</div>
    <div style="font-size:10px;line-height:1.5;">Fellow Spine Surgery, Germany</div>
    <div style="font-size:10px;line-height:1.5;">Fellow in Pain Management, AESCULAP Academy</div>
    <div style="font-size:10px;line-height:1.5;">Reg. No. 2003082904</div>
  </div>
  <img src="${nabh}" alt="NABH" style="width:62px;height:62px;object-fit:contain;flex-shrink:0;" />
</div>
<hr/>
<div style="text-align:center;font-weight:bold;font-size:12px;text-decoration:underline;margin:3px 0;">
  INITIAL ASSESSMENT SHEET FOR OPD PATIENTS &nbsp;&nbsp;&nbsp; Date: ${pt.date}
</div>
<div style="display:flex;gap:4px;margin-bottom:2px;align-items:baseline;font-size:11px;">
  <span style="font-weight:bold;">Name :</span>
  <span style="flex:1;border-bottom:1px solid ${C};">&nbsp;${pt.patient_name}</span>
  <span style="width:6px;"></span>
  <span style="font-weight:bold;">Age :</span>
  <span style="width:50px;border-bottom:1px solid ${C};">&nbsp;${pt.age}</span>
  <span style="width:4px;"></span>
  <span style="font-weight:bold;">Sex :</span>
  <span style="margin-left:3px;">M &nbsp; F</span>
</div>
<div style="display:flex;gap:4px;margin-bottom:4px;align-items:baseline;font-size:11px;">
  <span style="font-weight:bold;">UHID No.</span>
  <span style="width:90px;border-bottom:1px solid ${C};"></span>
  <span style="width:4px;"></span>
  <span style="font-weight:bold;">Known Allergies</span>
  <span style="flex:1;border-bottom:1px solid ${C};">&nbsp;${pt.known_allergies||""}</span>
</div>
<div style="margin-bottom:2px;font-size:11px;">
  <span style="font-weight:bold;">Nutritional Status: </span>
  ${NUTRITIONAL.map(n=>`<span style="margin-right:12px;">${pcheck(ptNutri.includes(n))}${n}</span>`).join("")}
</div>
<div style="margin-bottom:4px;font-size:11px;">
  <span style="margin-right:3px;">${pcheck(false)}</span><span style="font-weight:bold;">KICIO: </span>
  ${COMORBIDITIES.map(c=>`<span style="margin-right:8px;">${pcheck(ptComor.includes(c))}${c}</span>`).join("")}
</div>
<hr/>
<div style="margin-bottom:1px;font-size:11px;">
  <span style="font-weight:bold;">Chief Complaint: </span>
  <span style="border-bottom:1px solid ${C};display:inline-block;width:62%;">&nbsp;</span>
</div>
<div class="cgrid">${complaintGrid}</div>
<hr style="margin-top:3px;"/>
${ptConds?`<div style="margin-bottom:2px;font-size:11px;"><span style="font-weight:bold;">Clinical Conditions: </span>${ptConds}</div>`:""}
<div style="margin-bottom:1px;font-size:11px;">
  <span style="font-weight:bold;">Clinical findings: </span>
  <span style="border-bottom:1px solid ${C};display:inline-block;width:68%;">&nbsp;${ptFindings}</span>
</div>
<div style="border-bottom:1px solid ${C};min-height:13px;margin-bottom:1px;"></div>
<div style="border-bottom:1px solid ${C};min-height:13px;margin-bottom:4px;"></div>
<div style="margin-bottom:4px;font-size:11px;">
  <span style="font-weight:bold;">Final Diagnosis: </span>
  <span style="border-bottom:1px solid ${C};display:inline-block;width:72%;">&nbsp;${pt.diagnosis||""}</span>
</div>
<hr/>
${instrRows}
<div style="margin-top:2px;margin-bottom:1px;font-size:11px;">
  <span style="font-weight:bold;">Physiotherapy: </span>
  <span style="border-bottom:1px solid ${C};display:inline-block;width:71%;">&nbsp;${ptPhysio.length>0?ptPhysio.join(", "):""}</span>
</div>
<div style="border-bottom:1px solid ${C};min-height:11px;margin-bottom:2px;"></div>
<hr/>
<table class="meds">
  <thead>
    <tr>
      <th style="width:46%;">Medicine</th>
      <th style="width:18%;">Dose</th>
      <th style="width:22%;">Frequency</th>
      <th style="width:14%;">Duration</th>
    </tr>
  </thead>
  <tbody>${medRows}</tbody>
</table>
<hr/>
<div style="display:flex;align-items:center;gap:4px;margin-bottom:2px;font-size:11px;">
  <span style="font-weight:bold;">Follow up after : </span>
  ${followupChecks}
</div>
<div style="display:flex;gap:6px;margin-bottom:8px;align-items:baseline;font-size:11px;">
  <span style="font-weight:bold;">Next Visit</span>
  <span style="border:1px solid ${C};display:inline-block;padding:1px 6px;min-width:120px;font-size:10.5px;">${nextVisitStr}</span>
</div>
<div class="footer-wrap">
  <div class="fcol">
    <div style="border-left:2.5px solid ${C};padding-left:4px;">
      <div class="hn">NEEL orthopaedic AND MULTISPECIALITY HOSPITAL</div>
      <div>Shrinath Tower, Goddev Naka, BP Road, Bhayander (E), Thane - 401 105</div>
      <div>For Enquiry - 7021094941 / 9594314023</div>
      <div>For Appointment - 022-68493221 / 08047484820</div>
    </div>
  </div>
  <div class="fcol">
    <div style="border-left:2.5px solid ${C};padding-left:4px;">
      <div class="hn">NEEL orthopaedic SUPER SPECIALITY HOSPITAL</div>
      <div>1st Floor, Sheetal Niketan Co-operation Housing Society,</div>
      <div>Opposite HUM Video, B.P. Road,</div>
      <div>Bhayander (East), Mumbai - 401 105.</div>
    </div>
  </div>
  <div class="sig">Dr. G.K. Boob</div>
</div>
</body>
</html>`;
}

export default function PrescriptionPage() {
  const { user, loading: authLoading, signOut } = useAuth("/prescription");

  // Doctor role = "doctor", reception role = "reception"
  const role = user?.role === "doctor" ? "doctor" : "reception";

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [selectedToken, setSelectedToken] = useState<Token|null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [recForm, setRecForm] = useState({
    patient_name:"", age:"", sex:"Male", known_allergies:"",
    nutritional:[] as string[], comorbidities:[] as string[], chief_complaints:[] as string[],
  });
  const [editingTokenId, setEditingTokenId] = useState<number|null>(null);

  const [docForm, setDocForm] = useState({
    clinical_conditions:[] as string[], clinical_findings:"",
    diagnosis:"", instructions:[] as string[],
    physiotherapy:[] as string[], follow_up:"", next_visit:"",
  });

  const [medInput, setMedInput] = useState("");
  const [medSuggestions, setMedSuggestions] = useState<Medicine[]>([]);
  const [selectedMeds, setSelectedMeds] = useState<{name:string;dose:string;freq:string;days:string}[]>([]);
  const medRef = useRef<HTMLDivElement>(null);
  const [condSearch, setCondSearch] = useState("");
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (user) { fetchMedicines(); fetchTokens(); }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("opd_rx")
      .on("postgres_changes",{event:"*",schema:"public",table:"opd_prescription"},fetchTokens)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  const fetchMedicines = async () => {
    const {data} = await supabase.from("medicine_list").select("id,name").eq("type","opd").order("name");
    if (data) setMedicines(data);
  };

  const fetchTokens = async () => {
    const {data} = await supabase.from("opd_prescription").select("*").eq("date",today).order("token_number");
    if (data) {
      setTokens(data as Token[]);
      if (selectedToken) {
        const updated = (data as Token[]).find(t=>t.id===selectedToken.id);
        if (updated) setSelectedToken(updated);
      }
    }
  };

  const loadDocForm = (t: Token) => {
    const cfLines = (t.clinical_findings||"").split("\n");
    const allFlat = CLINICAL_CONDITIONS.flatMap(g=>
      g.category==="Fracture"?["Fracture"]:g.items.map(i=>`${g.category} - ${i}`)
    );
    const matched = cfLines[0].split(",").map(s=>s.trim()).filter(s=>allFlat.includes(s));
    setDocForm({
      clinical_conditions:matched,
      clinical_findings:cfLines.slice(1).join("\n"),
      diagnosis:t.diagnosis||"",
      instructions:parseArr(t.treatment),
      physiotherapy:parseArr(t.physiotherapy),
      follow_up:(t.follow_up||"").replace(" days",""),
      next_visit:t.next_visit||"",
    });
    if (t.medication) {
      setSelectedMeds(t.medication.split("\n").filter(Boolean).map(line=>{
        const parts=line.split("|").map(s=>s.trim());
        const nd=parts[0]||""; const si=nd.indexOf(" ");
        return {name:si>-1?nd.slice(0,si):nd,dose:si>-1?nd.slice(si+1):"",freq:parts[1]||"",days:(parts[2]||"").replace(" days","")};
      }));
    } else setSelectedMeds([]);
  };

  const loadRecForm = (t: Token) => {
    const arr=parseArr(t.chief_complaints);
    setRecForm({
      patient_name:t.patient_name||"",age:t.age?.toString()||"",sex:t.sex||"Male",
      known_allergies:t.known_allergies||"",
      nutritional:arr.filter(c=>NUTRITIONAL.includes(c)),
      comorbidities:arr.filter(c=>COMORBIDITIES.includes(c)),
      chief_complaints:arr.filter(c=>CHIEF_COMPLAINTS.includes(c)),
    });
    setEditingTokenId(t.id); setSaved(false);
  };

  const handleMedSearch = (val: string) => {
    setMedInput(val);
    if (val.length<2){setMedSuggestions([]);return;}
    setMedSuggestions(medicines.filter(m=>m.name.toLowerCase().includes(val.toLowerCase())).slice(0,10));
  };

  const addMedicine = (med: Medicine) => {
    setSelectedMeds(prev=>[...prev,{name:med.name,dose:"",freq:"",days:""}]);
    setMedInput(""); setMedSuggestions([]);
  };

  const saveReception = async () => {
    if (!recForm.patient_name||!recForm.chief_complaints.length) return;
    setSaving(true);
    const payload = {
      doctor_id:5, patient_name:recForm.patient_name,
      age:parseInt(recForm.age)||null, sex:recForm.sex, date:today,
      known_allergies:recForm.known_allergies,
      chief_complaints:[...recForm.nutritional,...recForm.comorbidities,...recForm.chief_complaints].join(", "),
      filled_by_reception:true, filled_by_doctor:false,
    };
    if (editingTokenId) {
      await supabase.from("opd_prescription").update(payload).eq("id",editingTokenId);
    } else {
      await supabase.from("opd_prescription").insert({...payload,token_number:tokens.length+1});
    }
    await fetchTokens(); setSaved(true); setSaving(false);
    setTimeout(()=>{
      setSaved(false); setEditingTokenId(null);
      setRecForm({patient_name:"",age:"",sex:"Male",known_allergies:"",nutritional:[],comorbidities:[],chief_complaints:[]});
    },2000);
  };

  const saveDoctor = async () => {
    if (!selectedToken||!docForm.diagnosis) return;
    setSaving(true);
    const medication=selectedMeds.map(m=>
      `${m.name}${m.dose?` ${m.dose}`:""}${m.freq?` | ${m.freq}`:""}${m.days?` | ${m.days} days`:""}`
    ).join("\n");
    const {error}=await supabase.from("opd_prescription").update({
      clinical_findings:[docForm.clinical_conditions.join(", "),docForm.clinical_findings].filter(Boolean).join("\n"),
      diagnosis:docForm.diagnosis,
      treatment:docForm.instructions.join(", "),
      medication,
      physiotherapy:docForm.physiotherapy.join(", "),
      follow_up:docForm.follow_up?`${docForm.follow_up} days`:"",
      next_visit:docForm.next_visit||null,
      filled_by_doctor:true,
    }).eq("id",selectedToken.id);
    if (error){alert("Save failed: "+error.message);setSaving(false);return;}
    await fetchTokens(); setSaved(true); setSaving(false);
  };

  const handlePrint = () => {
    if (!selectedToken) return;
    const pw = window.open("","_blank","width=794,height=600,scrollbars=no");
    if (!pw){alert("Please allow popups for this site to print.");return;}
    pw.document.write(buildPrintHTML(selectedToken));
    pw.document.close();
    pw.focus();
    pw.onload = () => {
      const contentH = pw.document.body.scrollHeight;
      pw.resizeTo(794, contentH + 40);
      setTimeout(()=>{ pw.print(); pw.close(); }, 600);
    };
    setTimeout(()=>{ try{ pw.print(); pw.close(); }catch(e){} }, 1800);
  };

  const filteredConditions = condSearch.length<1?CLINICAL_CONDITIONS
    :CLINICAL_CONDITIONS.map(g=>({...g,items:g.items.filter(i=>
        i.toLowerCase().includes(condSearch.toLowerCase())||
        g.category.toLowerCase().includes(condSearch.toLowerCase())
      )})).filter(g=>g.items.length>0);

  const sectionBox = (children: React.ReactNode, title: string) => (
    <div style={{background:"white",borderRadius:"14px",padding:"24px",marginBottom:"20px",border:"1px solid #e8edf5",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{fontWeight:"700",color:"#0a2463",fontSize:"15px",marginBottom:"16px",paddingBottom:"10px",borderBottom:"2px solid #f0f4ff"}}>{title}</div>
      {children}
    </div>
  );

  if (authLoading || !user) {
    return (
      <div style={{minHeight:"100vh",background:"#f0f4ff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Georgia, serif",color:"#0a2463"}}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{minHeight:"100vh",background:"#f0f4ff",fontFamily:"Georgia, serif"}}>
      <StaffNavbar user={user} onSignOut={signOut} />

      {/* Sub-header with action buttons */}
      <div style={{background:"#0a2463",padding:"0 5%",height:"52px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{color:"white",fontWeight:"700",fontSize:"15px"}}>
          {role==="reception"?"👩‍💼 Reception — Patient Entry":"👨‍⚕️ Dr. G.K. Boob — Prescription"}
        </div>
        <div style={{display:"flex",gap:"12px",alignItems:"center"}}>
          {role==="doctor"&&selectedToken&&(
            <>
              <button onClick={saveDoctor} disabled={saving}
                style={{background:saved?"#16a34a":"#1a73e8",color:"white",border:"none",padding:"8px 20px",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:"pointer",fontFamily:"Georgia, serif"}}>
                {saving?"Saving...":saved?"✓ Saved":"Save"}
              </button>
              <button onClick={handlePrint} disabled={!saved}
                style={{background:!saved?"rgba(255,255,255,0.15)":"white",color:!saved?"rgba(255,255,255,0.4)":"#0a2463",border:"none",padding:"8px 20px",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:!saved?"not-allowed":"pointer",fontFamily:"Georgia, serif"}}>
                🖨️ Print
              </button>
            </>
          )}
          {role==="reception"&&(
            <button onClick={saveReception} disabled={saving||!recForm.patient_name||!recForm.chief_complaints.length}
              style={{background:saving?"#94a3b8":saved?"#16a34a":"#1a73e8",color:"white",border:"none",padding:"8px 20px",borderRadius:"8px",fontSize:"14px",fontWeight:"600",cursor:"pointer",fontFamily:"Georgia, serif"}}>
              {saving?"Saving...":saved?"✓ Sent to Doctor":editingTokenId?"Update →":"Send to Doctor →"}
            </button>
          )}
        </div>
      </div>

      <div style={{padding:"24px 5%",display:"grid",gridTemplateColumns:"280px 1fr",gap:"24px",maxWidth:"1200px",margin:"0 auto"}}>
        {/* Sidebar */}
        <div style={{background:"white",borderRadius:"16px",padding:"20px",boxShadow:"0 2px 8px rgba(0,0,0,0.05)",height:"fit-content",position:"sticky",top:"24px"}}>
          <div style={{fontWeight:"700",color:"#0a2463",fontSize:"15px",marginBottom:"4px"}}>
            {role==="doctor"?"Today's Patients":"Today's Tokens"}
          </div>
          <div style={{fontSize:"12px",color:"#888",marginBottom:"12px"}}>
            {tokens.length} patient{tokens.length!==1?"s":""} · {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
          </div>
          {role==="reception"&&(
            <button onClick={()=>{setEditingTokenId(null);setSaved(false);setRecForm({patient_name:"",age:"",sex:"Male",known_allergies:"",nutritional:[],comorbidities:[],chief_complaints:[]});}}
              style={{width:"100%",padding:"10px",background:"#0a2463",color:"white",border:"none",borderRadius:"8px",fontSize:"13px",fontWeight:"600",cursor:"pointer",fontFamily:"Georgia, serif",marginBottom:"12px"}}>
              + New Patient
            </button>
          )}
          {tokens.length===0?(
            <div style={{color:"#999",fontSize:"13px",textAlign:"center",padding:"20px"}}>
              {role==="doctor"?"⏳ Waiting for reception...":"No patients yet today"}
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {tokens.map(t=>(
                <div key={t.id}
                  onClick={()=>{if(role==="doctor"){setSelectedToken(t);loadDocForm(t);setSaved(false);}else loadRecForm(t);}}
                  style={{padding:"12px",borderRadius:"10px",cursor:"pointer",border:"1.5px solid",borderColor:(role==="doctor"?selectedToken?.id:editingTokenId)===t.id?"#0a2463":"#e8edf5",background:(role==="doctor"?selectedToken?.id:editingTokenId)===t.id?"#f0f4ff":"white"}}>
                  <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                    <div style={{width:"32px",height:"32px",background:"#0a2463",borderRadius:"8px",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"800",fontSize:"13px",flexShrink:0}}>{t.token_number}</div>
                    <div>
                      <div style={{fontWeight:"600",fontSize:"13px",color:"#0a2463"}}>{t.patient_name}</div>
                      <div style={{fontSize:"11px",color:"#666"}}>{t.age} yrs · {t.sex}</div>
                      {role==="doctor"&&(
                        <div style={{fontSize:"11px",color:t.filled_by_doctor?"#16a34a":"#f59e0b",marginTop:"2px"}}>
                          {t.filled_by_doctor?"✓ Completed":"⏳ Pending"}
                        </div>
                      )}
                    </div>
                  </div>
                  {t.known_allergies&&(
                    <div style={{fontSize:"10px",color:"#dc2626",marginTop:"6px",background:"#fee2e2",padding:"3px 8px",borderRadius:"4px"}}>
                      ⚠️ {t.known_allergies}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <div>
          {role==="reception"&&(
            <div>
              {editingTokenId&&(
                <div style={{background:"#fef3c7",borderRadius:"10px",padding:"10px 16px",marginBottom:"16px",fontSize:"13px",color:"#92400e",border:"1px solid #fde68a"}}>
                  ✏️ Editing Token #{tokens.find(t=>t.id===editingTokenId)?.token_number} — {tokens.find(t=>t.id===editingTokenId)?.patient_name}
                </div>
              )}
              {sectionBox(
                <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:"16px"}}>
                  <div>
                    <label style={{display:"block",fontSize:"13px",fontWeight:"600",color:"#374151",marginBottom:"6px"}}>Patient Name *</label>
                    <input value={recForm.patient_name} onChange={e=>setRecForm({...recForm,patient_name:e.target.value})} placeholder="Full name" style={inp}/>
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:"13px",fontWeight:"600",color:"#374151",marginBottom:"6px"}}>Age</label>
                    <input type="number" value={recForm.age} onChange={e=>setRecForm({...recForm,age:e.target.value})} placeholder="Years" style={inp}/>
                  </div>
                  <div>
                    <label style={{display:"block",fontSize:"13px",fontWeight:"600",color:"#374151",marginBottom:"6px"}}>Sex</label>
                    <select value={recForm.sex} onChange={e=>setRecForm({...recForm,sex:e.target.value})} style={inp}>
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                </div>,"Patient Details"
              )}
              {sectionBox(
                <input value={recForm.known_allergies} onChange={e=>setRecForm({...recForm,known_allergies:e.target.value})}
                  placeholder="None / list any known allergies" style={{...inp,borderColor:"#fca5a5"}}/>,
                "⚠️ Known Allergies"
              )}
              {sectionBox(
                <div>
                  <div style={{marginBottom:"12px"}}>
                    <div style={{fontWeight:"600",fontSize:"13px",color:"#374151",marginBottom:"8px"}}>Nutritional Status:</div>
                    <div style={{display:"flex",gap:"20px"}}>
                      {NUTRITIONAL.map(n=>(
                        <label key={n} style={{display:"flex",alignItems:"center",cursor:"pointer",fontSize:"14px"}}>
                          <input type="checkbox" checked={recForm.nutritional.includes(n)} onChange={()=>setRecForm({...recForm,nutritional:toggle(recForm.nutritional,n)})} style={cb}/>{n}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{fontWeight:"600",fontSize:"13px",color:"#374151",marginBottom:"8px"}}>Co-morbidities (KICIO):</div>
                    <div style={{display:"flex",gap:"16px",flexWrap:"wrap"}}>
                      {COMORBIDITIES.map(c=>(
                        <label key={c} style={{display:"flex",alignItems:"center",cursor:"pointer",fontSize:"14px"}}>
                          <input type="checkbox" checked={recForm.comorbidities.includes(c)} onChange={()=>setRecForm({...recForm,comorbidities:toggle(recForm.comorbidities,c)})} style={cb}/>{c}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>,"Medical History"
              )}
              {sectionBox(
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:"8px"}}>
                  {CHIEF_COMPLAINTS.map(c=>(
                    <label key={c} style={{display:"flex",alignItems:"center",cursor:"pointer",fontSize:"14px",padding:"6px",borderRadius:"6px",background:recForm.chief_complaints.includes(c)?"#f0f4ff":"transparent"}}>
                      <input type="checkbox" checked={recForm.chief_complaints.includes(c)} onChange={()=>setRecForm({...recForm,chief_complaints:toggle(recForm.chief_complaints,c)})} style={cb}/>{c}
                    </label>
                  ))}
                </div>,"Chief Complaint *"
              )}
              <button onClick={saveReception} disabled={saving||!recForm.patient_name||!recForm.chief_complaints.length}
                style={{width:"100%",padding:"16px",background:saving||!recForm.patient_name||!recForm.chief_complaints.length?"#94a3b8":"#0a2463",color:"white",border:"none",borderRadius:"12px",fontSize:"16px",fontWeight:"700",cursor:"pointer",fontFamily:"Georgia, serif"}}>
                {saving?"Saving...":saved?"✓ Sent to Doctor's Screen":editingTokenId?"Update Patient →":"Send to Doctor →"}
              </button>
            </div>
          )}

          {role==="doctor"&&!selectedToken&&(
            <div style={{background:"white",borderRadius:"16px",padding:"60px",textAlign:"center",boxShadow:"0 2px 8px rgba(0,0,0,0.05)"}}>
              <div style={{fontSize:"48px",marginBottom:"16px"}}>👈</div>
              <div style={{fontWeight:"700",color:"#0a2463",fontSize:"18px",marginBottom:"8px"}}>Select a patient from the list</div>
              <div style={{color:"#888",fontSize:"14px"}}>Click a token to open their prescription</div>
              {tokens.length===0&&<div style={{color:"#f59e0b",fontSize:"13px",marginTop:"12px"}}>⏳ Waiting for reception to add patients...</div>}
            </div>
          )}

          {role==="doctor"&&selectedToken&&(
            <div>
              <div style={{background:"#0a2463",borderRadius:"14px",padding:"20px 24px",marginBottom:"20px",display:"flex",alignItems:"flex-start",gap:"16px"}}>
                <div style={{width:"48px",height:"48px",background:"rgba(255,255,255,0.15)",borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontWeight:"800",fontSize:"20px",flexShrink:0}}>{selectedToken.token_number}</div>
                <div style={{flex:1}}>
                  <div style={{color:"white",fontWeight:"700",fontSize:"18px"}}>{selectedToken.patient_name}</div>
                  <div style={{color:"rgba(255,255,255,0.7)",fontSize:"13px"}}>Age: {selectedToken.age} · {selectedToken.sex}</div>
                  {selectedToken.known_allergies&&<div style={{color:"#fca5a5",fontSize:"13px",marginTop:"4px"}}>⚠️ Allergies: {selectedToken.known_allergies}</div>}
                  {selectedToken.chief_complaints&&(
                    <div style={{marginTop:"8px",background:"rgba(255,255,255,0.1)",borderRadius:"8px",padding:"8px 12px"}}>
                      <div style={{color:"rgba(255,255,255,0.6)",fontSize:"11px",marginBottom:"3px"}}>CHIEF COMPLAINT</div>
                      <div style={{color:"white",fontSize:"13px"}}>{parseArr(selectedToken.chief_complaints).filter(c=>CHIEF_COMPLAINTS.includes(c)).join(" · ")}</div>
                    </div>
                  )}
                </div>
              </div>

              {sectionBox(
                <div>
                  <input value={condSearch} onChange={e=>setCondSearch(e.target.value)} placeholder="Search condition..."
                    style={{...inp,marginBottom:"16px",width:"260px"}}/>
                  <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>
                    {filteredConditions.map(group=>(
                      <div key={group.category}>
                        <div style={{fontWeight:"700",fontSize:"12px",color:"#0a2463",marginBottom:"8px",textTransform:"uppercase",letterSpacing:"0.06em"}}>{group.category}</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:"8px",paddingLeft:"8px"}}>
                          {group.category==="Fracture"?(
                            <label style={{display:"flex",alignItems:"center",cursor:"pointer",fontSize:"14px",padding:"6px 12px",borderRadius:"6px",background:docForm.clinical_conditions.includes("Fracture")?"#f0f4ff":"transparent",border:"1px solid",borderColor:docForm.clinical_conditions.includes("Fracture")?"#0a2463":"#e8edf5"}}>
                              <input type="checkbox" checked={docForm.clinical_conditions.includes("Fracture")} onChange={()=>setDocForm({...docForm,clinical_conditions:toggle(docForm.clinical_conditions,"Fracture")})} style={cb}/>Fracture
                            </label>
                          ):(
                            group.items.map(item=>{
                              const key=`${group.category} - ${item}`;
                              return(
                                <label key={item} style={{display:"flex",alignItems:"center",cursor:"pointer",fontSize:"14px",padding:"6px 12px",borderRadius:"6px",background:docForm.clinical_conditions.includes(key)?"#f0f4ff":"transparent",border:"1px solid",borderColor:docForm.clinical_conditions.includes(key)?"#0a2463":"#e8edf5"}}>
                                  <input type="checkbox" checked={docForm.clinical_conditions.includes(key)} onChange={()=>setDocForm({...docForm,clinical_conditions:toggle(docForm.clinical_conditions,key)})} style={cb}/>{item}
                                </label>
                              );
                            })
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>,"Clinical Conditions"
              )}
              {sectionBox(
                <textarea value={docForm.clinical_findings} onChange={e=>setDocForm({...docForm,clinical_findings:e.target.value})}
                  placeholder="Examination findings..." rows={3} style={{...inp,resize:"vertical",fontFamily:"Georgia, serif"}}/>,
                "Clinical Findings"
              )}
              {sectionBox(
                <textarea value={docForm.diagnosis} onChange={e=>setDocForm({...docForm,diagnosis:e.target.value})}
                  placeholder="Final diagnosis..." rows={2} style={{...inp,resize:"vertical",fontFamily:"Georgia, serif",borderColor:"#a5b4fc"}}/>,
                "Final Diagnosis *"
              )}
              {sectionBox(
                <div style={{display:"flex",gap:"20px",flexWrap:"wrap"}}>
                  {INSTRUCTIONS.map(ins=>(
                    <label key={ins} style={{display:"flex",alignItems:"center",cursor:"pointer",fontSize:"14px"}}>
                      <input type="checkbox" checked={docForm.instructions.includes(ins)} onChange={()=>setDocForm({...docForm,instructions:toggle(docForm.instructions,ins)})} style={cb}/>{ins}
                    </label>
                  ))}
                </div>,"Instructions"
              )}
              {sectionBox(
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:"8px"}}>
                  {PHYSIOTHERAPY.map(p=>(
                    <label key={p} style={{display:"flex",alignItems:"center",cursor:"pointer",fontSize:"14px"}}>
                      <input type="checkbox" checked={docForm.physiotherapy.includes(p)} onChange={()=>setDocForm({...docForm,physiotherapy:toggle(docForm.physiotherapy,p)})} style={cb}/>{p}
                    </label>
                  ))}
                </div>,"Physiotherapy"
              )}
              {sectionBox(
                <div>
                  <div style={{position:"relative",marginBottom:"16px"}} ref={medRef}>
                    <input value={medInput} onChange={e=>handleMedSearch(e.target.value)} placeholder="Type 2+ letters to search medicine..." style={inp}/>
                    {medSuggestions.length>0&&(
                      <div style={{position:"absolute",top:"100%",left:0,right:0,background:"white",borderRadius:"8px",border:"1.5px solid #e0e7ff",boxShadow:"0 8px 24px rgba(0,0,0,0.1)",zIndex:50,maxHeight:"200px",overflowY:"auto"}}>
                        {medSuggestions.map(m=>(
                          <div key={m.id} onClick={()=>addMedicine(m)}
                            style={{padding:"10px 16px",cursor:"pointer",fontSize:"14px",borderBottom:"1px solid #f0f0f0"}}
                            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#f0f4ff"}
                            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="white"}>
                            {m.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedMeds.length>0&&(
                    <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                      {selectedMeds.map((med,i)=>(
                        <div key={i} style={{background:"#f8f9fc",borderRadius:"10px",padding:"12px 16px",border:"1px solid #e8edf5"}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"8px"}}>
                            <div style={{fontWeight:"700",color:"#0a2463",fontSize:"14px"}}>{med.name}</div>
                            <button onClick={()=>setSelectedMeds(p=>p.filter((_,idx)=>idx!==i))} style={{background:"#fee2e2",color:"#dc2626",border:"none",padding:"4px 10px",borderRadius:"6px",fontSize:"12px",cursor:"pointer",fontFamily:"Georgia, serif"}}>Remove</button>
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px"}}>
                            <input placeholder="Dose (e.g. 500mg)" value={med.dose} onChange={e=>setSelectedMeds(p=>p.map((m,idx)=>idx===i?{...m,dose:e.target.value}:m))} style={{padding:"8px 10px",borderRadius:"6px",border:"1px solid #e0e7ff",fontSize:"13px",fontFamily:"Georgia, serif"}}/>
                            <input placeholder="Frequency (e.g. BD)" value={med.freq} onChange={e=>setSelectedMeds(p=>p.map((m,idx)=>idx===i?{...m,freq:e.target.value}:m))} style={{padding:"8px 10px",borderRadius:"6px",border:"1px solid #e0e7ff",fontSize:"13px",fontFamily:"Georgia, serif"}}/>
                            <input placeholder="Duration (days)" value={med.days} onChange={e=>setSelectedMeds(p=>p.map((m,idx)=>idx===i?{...m,days:e.target.value}:m))} style={{padding:"8px 10px",borderRadius:"6px",border:"1px solid #e0e7ff",fontSize:"13px",fontFamily:"Georgia, serif"}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>,"Medicines"
              )}
              {sectionBox(
                <div style={{display:"flex",alignItems:"center",gap:"24px",flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontWeight:"600",fontSize:"13px",color:"#374151",marginBottom:"8px"}}>Follow up after:</div>
                    <div style={{display:"flex",gap:"16px"}}>
                      {FOLLOW_UP_DAYS.map(f=>(
                        <label key={f} style={{display:"flex",alignItems:"center",cursor:"pointer",fontSize:"15px",fontWeight:"600"}}>
                          <input type="radio" name="followup" value={f} checked={docForm.follow_up===f} onChange={()=>setDocForm({...docForm,follow_up:f})} style={{marginRight:"6px",accentColor:"#0a2463"}}/>{f} days
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div style={{fontWeight:"600",fontSize:"13px",color:"#374151",marginBottom:"8px"}}>Next Visit:</div>
                    <input type="date" value={docForm.next_visit} onChange={e=>setDocForm({...docForm,next_visit:e.target.value})}
                      style={{padding:"10px 14px",borderRadius:"8px",border:"1.5px solid #e0e7ff",fontSize:"15px",fontFamily:"Georgia, serif"}}/>
                  </div>
                </div>,"Follow Up"
              )}
              <div style={{display:"flex",gap:"12px"}}>
                <button onClick={saveDoctor} disabled={saving||!docForm.diagnosis}
                  style={{flex:1,padding:"14px",background:saving||!docForm.diagnosis?"#94a3b8":"#0a2463",color:"white",border:"none",borderRadius:"10px",fontSize:"16px",fontWeight:"700",cursor:"pointer",fontFamily:"Georgia, serif"}}>
                  {saving?"Saving...":saved?"✓ Prescription Saved":"Save Prescription"}
                </button>
                <button onClick={handlePrint} disabled={!saved}
                  style={{padding:"14px 24px",background:!saved?"#e2e8f0":"white",color:!saved?"#94a3b8":"#0a2463",border:"2px solid",borderColor:!saved?"#e2e8f0":"#0a2463",borderRadius:"10px",fontSize:"16px",fontWeight:"700",cursor:!saved?"not-allowed":"pointer",fontFamily:"Georgia, serif"}}>
                  🖨️ Print
                </button>
              </div>
              {!saved&&(
                <div style={{textAlign:"center",fontSize:"12px",color:"#94a3b8",marginTop:"8px"}}>
                  Save prescription first to enable printing
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}