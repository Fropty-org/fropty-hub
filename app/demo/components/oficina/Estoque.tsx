"use client";
import { useState } from "react";
import { PECAS } from "./data";
import type { Peca } from "./data";
type Props = { addToast:(type:"success"|"error"|"warning"|"info",msg:string)=>void };
export default function Estoque({ addToast }: Props) {
  const [pecas, setPecas] = useState<Peca[]>(PECAS);
  const [search, setSearch] = useState("");
  const critical = pecas.filter(p=>p.quantidade<p.minimo).length;
  const filtered = pecas.filter(p=>p.nome.toLowerCase().includes(search.toLowerCase())||p.codigo.toLowerCase().includes(search.toLowerCase()));
  const inputS:React.CSSProperties={padding:"9px 12px",background:"var(--input-bg)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text)",fontSize:14,outline:"none",boxSizing:"border-box"};
  return (
    <div style={{padding:24}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
        <h2 style={{fontSize:20,fontWeight:700,color:"var(--text)",margin:0}}>Estoque de Peças</h2>
        {critical>0&&<span style={{background:"rgba(239,68,68,0.15)",color:"#EF4444",borderRadius:999,padding:"2px 10px",fontSize:12,fontWeight:700}}>⚠️ {critical} críticas</span>}
        <button onClick={()=>addToast("info","Cadastro de peças em breve!")} style={{marginLeft:"auto",padding:"8px 14px",border:"1px solid var(--border)",borderRadius:10,background:"transparent",color:"var(--text-muted)",fontSize:13,cursor:"pointer"}}>
          <i className="ti ti-plus" style={{marginRight:6}}/>Cadastrar peça
        </button>
      </div>
      <div style={{position:"relative",marginBottom:20,maxWidth:320}}>
        <i className="ti ti-search" style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:15,color:"var(--text-faint)"}}/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nome ou código..." style={{...inputS,paddingLeft:34,width:"100%"}}/>
      </div>
      <div style={{background:"var(--card-bg)",border:"1px solid var(--card-border)",borderRadius:14,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>{["Peça","Código","Qtd","Mínimo","Preço unit.","Fornecedor",""].map(h=>(
                <th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em",color:"var(--text-faint)",borderBottom:"1px solid var(--border)",whiteSpace:"nowrap"}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.length===0&&<tr><td colSpan={7} style={{padding:"40px",textAlign:"center",color:"var(--text-muted)",fontSize:13}}>Nenhuma peça encontrada</td></tr>}
              {filtered.map((p,i)=>{
                const crit=p.quantidade<p.minimo;
                return(
                  <tr key={p.id} style={{background:crit?"rgba(239,68,68,0.05)":i%2===1?"rgba(255,255,255,0.015)":"transparent",borderLeft:crit?"3px solid #EF4444":"3px solid transparent"}}>
                    <td style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:14,fontWeight:600,color:"var(--text)"}}>{p.nome}</td>
                    <td style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:12,fontFamily:"monospace",color:"var(--text-muted)"}}>{p.codigo}</td>
                    <td style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:14,fontWeight:700,color:crit?"#EF4444":"#10B981",textAlign:"center"}}>
                      {p.quantidade}{crit&&" ⚠️"}
                    </td>
                    <td style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:13,color:"var(--text-faint)",textAlign:"center"}}>{p.minimo}</td>
                    <td style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:13,color:"var(--text)",fontWeight:600}}>{p.precoUnit.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td>
                    <td style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)",fontSize:12,color:"var(--text-muted)"}}>{p.fornecedor}</td>
                    <td style={{padding:"12px 14px",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                      <button onClick={()=>addToast("success",`Pedido enviado: "${p.nome}" ao ${p.fornecedor}!`)} style={{padding:"5px 12px",border:"1px solid #EF9F27",borderRadius:8,background:"transparent",color:"#EF9F27",fontSize:12,cursor:"pointer",fontWeight:600,whiteSpace:"nowrap"}}>
                        Solicitar reposição
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
