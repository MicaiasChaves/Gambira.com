import { useState, useMemo, useEffect } from "react";
import { supabase } from "./supabase";
import Login from "./Login";

// ═══════════════════════════════════════════════════════════════
// DADOS INICIAIS
// ═══════════════════════════════════════════════════════════════
const INIT_CLIENTES = [
  { id:1, cpf:"123.456.789-00", nome:"Rafael Souza",  telefone:"(11) 99999-1111", instagram:"@rafasouza",  cep:"01310-100", endereco:"Av. Paulista, 1000, SP", status:"ativo" },
  { id:2, cpf:"987.654.321-00", nome:"Camila Torres", telefone:"(21) 98888-2222", instagram:"@camitorrres", cep:"20040-020", endereco:"Rua da Assembléia, 10, RJ", status:"ativo" },
  { id:3, cpf:"111.222.333-44", nome:"Marcos Lima",   telefone:"(31) 97777-3333", instagram:"@marcoslima",  cep:"30112-000", endereco:"Av. Afonso Pena, 500, MG", status:"inadimplente" },
  { id:4, cpf:"444.555.666-77", nome:"Pedro Alves",   telefone:"(11) 91234-5678", instagram:"@pedroalves",  cep:"01001-000", endereco:"Praça da Sé, 1, SP",       status:"ativo" },
];

const INIT_CONTRATOS = [
  { id:1, clienteId:1, clienteNome:"Rafael Souza",  produto:"iPhone 14 Pro",    valor:5400, parcelas:12, parcelasQuitadas:8,  vencimento:"2025-07-15", status:"ativo",   instagram:"@rafasouza" },
  { id:2, clienteId:2, clienteNome:"Camila Torres", produto:"Samsung S23",       valor:3200, parcelas:6,  parcelasQuitadas:6,  vencimento:"2024-12-20", status:"quitado", instagram:"@camitorrres" },
  { id:3, clienteId:3, clienteNome:"Marcos Lima",   produto:"Motorola Edge 40",  valor:1800, parcelas:3,  parcelasQuitadas:1,  vencimento:"2025-05-10", status:"vencido", instagram:"@marcoslima" },
  { id:4, clienteId:1, clienteNome:"Rafael Souza",  produto:"iPad Air",          valor:4200, parcelas:10, parcelasQuitadas:10, vencimento:"2024-11-01", status:"quitado", instagram:"@rafasouza" },
];

const INIT_ESTOQUE = [
  { id:1, produto:"iPhone 15 Pro Max",   categoria:"Celular",   quantidade:3,  preco_custo:6500, preco_venda:8200, imei:"356789012345678" },
  { id:2, produto:"Samsung Galaxy S24",  categoria:"Celular",   quantidade:5,  preco_custo:3800, preco_venda:4900, imei:"490123456789012" },
  { id:3, produto:"Motorola Edge 50",    categoria:"Celular",   quantidade:2,  preco_custo:1800, preco_venda:2400, imei:"123456789012345" },
  { id:4, produto:"Cabo USB-C 2m",       categoria:"Acessório", quantidade:20, preco_custo:18,   preco_venda:45,   imei:"—" },
  { id:5, produto:"Capinha iPhone 15",   categoria:"Acessório", quantidade:15, preco_custo:12,   preco_venda:35,   imei:"—" },
  { id:6, produto:"Fone Bluetooth",      categoria:"Acessório", quantidade:8,  preco_custo:80,   preco_venda:150,  imei:"—" },
  { id:7, produto:"Película 3D",         categoria:"Acessório", quantidade:30, preco_custo:5,    preco_venda:20,   imei:"—" },
  { id:8, produto:"Carregador 65W",      categoria:"Acessório", quantidade:10, preco_custo:35,   preco_venda:85,   imei:"—" },
];

const INIT_MANUTENCOES = [
  { id:1, clienteId:1, clienteNome:"Rafael Souza",  servico:"Troca de tela",     valor:380, custo_peca:120, custo_tecnico:80, data:"2025-04-10", categoria:"Tela" },
  { id:2, clienteId:2, clienteNome:"Camila Torres", servico:"Troca de bateria",  valor:150, custo_peca:45,  custo_tecnico:30, data:"2025-04-12", categoria:"Bateria" },
  { id:3, clienteId:3, clienteNome:"Marcos Lima",   servico:"Conector de carga", valor:120, custo_peca:25,  custo_tecnico:40, data:"2025-04-15", categoria:"Conector" },
  { id:4, clienteId:1, clienteNome:"Rafael Souza",  servico:"Troca de tela",     valor:420, custo_peca:130, custo_tecnico:80, data:"2025-03-22", categoria:"Tela" },
  { id:5, clienteId:2, clienteNome:"Camila Torres", servico:"Troca de bateria",  valor:150, custo_peca:45,  custo_tecnico:30, data:"2025-03-05", categoria:"Bateria" },
];

// vendas agora referenciam estoqueId para dar baixa automática
const INIT_VENDAS = [
  { id:1, clienteId:4, clienteNome:"Pedro Alves",   estoqueId:1, produto:"iPhone 15 Pro Max", categoria:"Celular",   quantidade:1, preco_custo:6500, preco_venda:8200, total_venda:8200, total_custo:6500, data:"2025-04-10" },
  { id:2, clienteId:4, clienteNome:"Pedro Alves",   estoqueId:4, produto:"Cabo USB-C 2m",      categoria:"Acessório", quantidade:10,preco_custo:18,   preco_venda:45,   total_venda:450,  total_custo:180,  data:"2025-04-10" },
  { id:3, clienteId:4, clienteNome:"Pedro Alves",   estoqueId:6, produto:"Fone Bluetooth",     categoria:"Acessório", quantidade:3, preco_custo:80,   preco_venda:150,  total_venda:450,  total_custo:240,  data:"2025-04-10" },
  { id:4, clienteId:2, clienteNome:"Camila Torres", estoqueId:5, produto:"Capinha iPhone 15",  categoria:"Acessório", quantidade:1, preco_custo:12,   preco_venda:35,   total_venda:35,   total_custo:12,   data:"2025-04-14" },
  { id:5, clienteId:1, clienteNome:"Rafael Souza",  estoqueId:7, produto:"Película 3D",        categoria:"Acessório", quantidade:2, preco_custo:5,    preco_venda:20,   total_venda:40,   total_custo:10,   data:"2025-03-18" },
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const fmt   = v => Number(v||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const fnum  = v => Number(v||0).toLocaleString("pt-BR");
const hoje  = new Date().toISOString().split("T")[0];
const mesAtual = hoje.slice(0,7);
const anoAtual = hoje.slice(0,4);

function diasPara(d){ return Math.ceil((new Date(d)-new Date())/86400000); }
function statusContrato(c){
  if(c.status==="quitado") return "quitado";
  const d=diasPara(c.vencimento);
  if(d<0) return "vencido";
  if(d<=7) return "vence_breve";
  return "ativo";
}
function valorRestante(c){
  if(statusContrato(c)==="quitado") return 0;
  return (c.parcelas-c.parcelasQuitadas)*(c.valor/c.parcelas);
}
function montanteTotal(contratos){ return contratos.reduce((a,c)=>a+valorRestante(c),0); }

async function buscarCEP(cep){
  try{
    const r=await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g,"")}/json/`);
    const d=await r.json();
    if(d.erro) return null;
    return `${d.logradouro}, ${d.bairro}, ${d.localidade} - ${d.uf}`;
  } catch{ return null; }
}

// ═══════════════════════════════════════════════════════════════
// UI ATOMS
// ═══════════════════════════════════════════════════════════════
const C = { bg:"#080d1a", card:"#161b2e", panel:"#0d1220", border:"#1e2a45", text:"#e2e8f0", muted:"#8fa3c8", dim:"#4a5568", blue:"#3b82f6", green:"#22c55e", red:"#ef4444", yellow:"#f59e0b", purple:"#a855f7", pink:"#e1306c" };

function Card({children,style={}}){ return <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:16,padding:20,...style}}>{children}</div>; }
function Panel({children,style={}}){ return <div style={{background:C.panel,borderRadius:10,padding:"11px 14px",...style}}>{children}</div>; }

function Badge({tipo}){
  const map={ativo:[C.green,"Ativo"],quitado:[C.blue,"Quitado"],vencido:[C.red,"Vencido"],vence_breve:[C.yellow,"Vence em breve"]};
  const [color,label]=map[tipo]||[C.muted,tipo];
  return <span style={{background:color+"22",color,border:`1px solid ${color}55`,padding:"2px 10px",borderRadius:20,fontSize:12,fontWeight:700,whiteSpace:"nowrap"}}>{label}</span>;
}

function Stat({icon,label,value,color=C.blue,sub}){
  return(
    <Card style={{display:"flex",flexDirection:"column",gap:5}}>
      <span style={{fontSize:20}}>{icon}</span>
      <span style={{fontSize:18,fontWeight:800,color}}>{value}</span>
      <span style={{fontSize:11,color:C.muted,fontWeight:600,letterSpacing:".4px"}}>{label}</span>
      {sub&&<span style={{fontSize:10,color:C.dim}}>{sub}</span>}
    </Card>
  );
}

function Input({label,value,onChange,placeholder,type="text",style={}}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5,...style}}>
      {label&&<label style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:".5px"}}>{label}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}
        onFocus={e=>e.target.style.borderColor=C.blue} onBlur={e=>e.target.style.borderColor=C.border}/>
    </div>
  );
}

function Sel({label,value,onChange,children,style={}}){
  return(
    <div style={{display:"flex",flexDirection:"column",gap:5,...style}}>
      {label&&<label style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:".5px"}}>{label}</label>}
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:10,padding:"9px 13px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}>
        {children}
      </select>
    </div>
  );
}

function Btn({children,onClick,color=C.blue,small,disabled,style={}}){
  return(
    <button onClick={onClick} disabled={disabled}
      style={{background:disabled?"#1e2a45":color,color:disabled?C.dim:"#fff",border:"none",borderRadius:9,
        padding:small?"6px 12px":"9px 18px",fontSize:small?12:13,fontWeight:700,cursor:disabled?"not-allowed":"pointer",fontFamily:"inherit",...style}}
      onMouseEnter={e=>!disabled&&(e.target.style.opacity=".82")}
      onMouseLeave={e=>!disabled&&(e.target.style.opacity="1")}>
      {children}
    </button>
  );
}

function TabBtn({active,color=C.blue,onClick,children}){
  return(
    <button onClick={onClick} style={{background:active?color+"22":"transparent",border:`1px solid ${active?color:C.border}`,
      color:active?color:C.muted,borderRadius:8,padding:"5px 13px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
      {children}
    </button>
  );
}

function SectionTitle({children}){ return <h2 style={{margin:0,fontSize:21,fontWeight:800,color:C.text}}>{children}</h2>; }

function MiniBar({value,max,color}){
  const pct=max>0?Math.max(4,(value/max)*100):4;
  return <div style={{height:6,borderRadius:3,background:C.border,overflow:"hidden",flex:1}}>
    <div style={{height:"100%",width:`${pct}%`,background:color,borderRadius:3,transition:"width .4s"}}/>
  </div>;
}

function Row({label,value,color=C.muted,bold}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
      <span style={{fontSize:13,color:C.muted}}>{label}</span>
      <span style={{fontSize:13,fontWeight:bold?800:700,color}}>{value}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════════════════════
const TABS=[
  {id:"dashboard",  icon:"📊",label:"Dashboard"},
  {id:"clientes",   icon:"👥",label:"Clientes"},
  {id:"contratos",  icon:"📄",label:"Contratos"},
  {id:"estoque",    icon:"📦",label:"Estoque"},
  {id:"vendas",     icon:"🛒",label:"Vendas"},
  {id:"manutencao", icon:"🔧",label:"Manutenção"},
  {id:"cobranca",   icon:"💬",label:"Cobrança"},
  {id:"financeiro", icon:"💰",label:"Financeiro"},
  {id:"inteligencia",icon:"🧠",label:"Inteligência"},
];

// ═══════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════
function Dashboard({contratos,manutencoes,estoque,vendas}){
  const montante=montanteTotal(contratos);
  const recMes=manutencoes.filter(m=>m.data.startsWith(mesAtual)).reduce((a,b)=>a+b.valor,0);
  const vendasMes=vendas.filter(v=>v.data.startsWith(mesAtual)).reduce((a,b)=>a+b.total_venda,0);
  const custoMes=manutencoes.filter(m=>m.data.startsWith(mesAtual)).reduce((a,b)=>a+(b.custo_peca||0)+(b.custo_tecnico||0),0)
               +vendas.filter(v=>v.data.startsWith(mesAtual)).reduce((a,b)=>a+b.total_custo,0);
  const lucroMes=recMes+vendasMes-custoMes;
  const estoqueZero=estoque.filter(e=>e.quantidade===0).length;
  const estoqueBaixo=estoque.filter(e=>e.quantidade>0&&e.quantidade<=2).length;

  const vencHoje=contratos.filter(c=>{const d=diasPara(c.vencimento);return d>=0&&d<=1&&statusContrato(c)!=="quitado";});
  const rankMn={};
  manutencoes.forEach(m=>{rankMn[m.clienteNome]=(rankMn[m.clienteNome]||0)+m.valor;});
  const rank=Object.entries(rankMn).sort((a,b)=>b[1]-a[1]).slice(0,3);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div>
        <h2 style={{margin:0,fontSize:22,fontWeight:800,color:C.text}}>Visão Geral</h2>
        <p style={{margin:"3px 0 0",color:C.muted,fontSize:12}}>Gambira.Com — Painel de controle</p>
      </div>

      <Card style={{background:"linear-gradient(135deg,#0f1f3d,#1a1040)",border:`1px solid ${C.blue}33`,padding:"20px 22px"}}>
        <p style={{margin:0,fontSize:11,color:C.muted,fontWeight:700,letterSpacing:".8px"}}>💰 TOTAL A RECEBER — TODAS AS PARCELAS FUTURAS</p>
        <p style={{margin:"5px 0 0",fontSize:36,fontWeight:800,color:C.blue}}>{fmt(montante)}</p>
        <p style={{margin:"3px 0 0",fontSize:11,color:C.dim}}>Atualiza automaticamente a cada parcela paga ou novo contrato</p>
      </Card>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:11}}>
        <Stat icon="📄" label="Contratos ativos"     value={contratos.filter(c=>["ativo","vence_breve"].includes(statusContrato(c))).length} color={C.blue}/>
        <Stat icon="⚠️" label="Vencidos"             value={contratos.filter(c=>statusContrato(c)==="vencido").length} color={C.red}/>
        <Stat icon="🔧" label="Manutenção/mês"       value={fmt(recMes)}    color={C.purple}/>
        <Stat icon="🛒" label="Vendas/mês"           value={fmt(vendasMes)} color={C.yellow}/>
        <Stat icon="💰" label="Lucro estimado/mês"   value={fmt(lucroMes)}  color={C.green}/>
        <Stat icon="📦" label="Estoque crítico" value={`${estoqueZero} zerado · ${estoqueBaixo} baixo`} color={estoqueBaixo+estoqueZero>0?C.red:C.green}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card>
          <h3 style={{margin:"0 0 12px",fontSize:14,color:C.yellow,fontWeight:700}}>⚡ Vencendo hoje / amanhã</h3>
          {vencHoje.length===0
            ?<p style={{color:C.dim,margin:0,fontSize:13}}>Nenhum vencimento imediato 🎉</p>
            :vencHoje.map(c=>(
              <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
                <div><p style={{margin:0,fontSize:13,fontWeight:700,color:C.text}}>{c.clienteNome}</p><p style={{margin:0,fontSize:11,color:C.muted}}>{c.produto}</p></div>
                <a href={`https://instagram.com/${c.instagram.replace("@","")}`} target="_blank" rel="noreferrer" style={{color:C.pink,fontSize:12,fontWeight:700,textDecoration:"none"}}>{c.instagram} ↗</a>
              </div>
            ))}
        </Card>
        <Card>
          <h3 style={{margin:"0 0 12px",fontSize:14,color:C.purple,fontWeight:700}}>🏆 Ranking Manutenção</h3>
          {rank.map(([nome,val],i)=>(
            <div key={nome} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:13,color:i===0?C.yellow:C.text,fontWeight:700}}>{["🥇","🥈","🥉"][i]} {nome}</span>
              <span style={{fontSize:13,color:C.green,fontWeight:700}}>{fmt(val)}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CLIENTES
// ═══════════════════════════════════════════════════════════════
function Clientes({clientes,setClientes,contratos,vendas,manutencoes}){
  const empty={cpf:"",nome:"",telefone:"",instagram:"",cep:"",endereco:"",status:"ativo"};
  const [form,setForm]=useState(empty);
  const [busca,setBusca]=useState("");
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState("");
  const [aba,setAba]=useState("ativo");
  const [confirmDelete,setConfirmDelete]=useState(null);
  const [detalhe,setDetalhe]=useState(null);
  const f=k=>v=>setForm(p=>({...p,[k]:v}));

  async function handleCPF(cpf){
    f("cpf")(cpf);
    if(cpf.replace(/\D/g,"").length===11){
      setLoading(true);
      const found=clientes.find(c=>c.cpf===cpf);
      if(found){setForm(p=>({...p,nome:found.nome,telefone:found.telefone}));setMsg("✅ Cliente encontrado!");}
      else setMsg("CPF não cadastrado. Preencha os dados.");
      setLoading(false); setTimeout(()=>setMsg(""),3000);
    }
  }
  async function handleCEP(cep){
    f("cep")(cep);
    if(cep.replace(/\D/g,"").length===8){
      setLoading(true);
      const end=await buscarCEP(cep);
      if(end){setForm(p=>({...p,endereco:end}));setMsg("✅ Endereço encontrado!");}
      setLoading(false); setTimeout(()=>setMsg(""),3000);
    }
  }
  function salvar(){
    if(!form.nome||!form.cpf) return setMsg("⚠️ Nome e CPF obrigatórios.");
    setClientes(p=>[...p,{...form,id:Date.now()}]);
    setForm(empty); setMsg("✅ Cadastrado!"); setTimeout(()=>setMsg(""),3000);
  }

  function perfilCliente(c){
    const vs=vendas.filter(v=>v.clienteId===c.id);
    const ms=manutencoes.filter(m=>m.clienteId===c.id);
    const cs=contratos.filter(x=>x.clienteId===c.id);
    const totalVenda=vs.reduce((a,b)=>a+b.total_venda,0);
    const totalMn=ms.reduce((a,b)=>a+b.valor,0);
    const aReceber=cs.reduce((a,x)=>a+valorRestante(x),0);
    return{vs,ms,cs,totalVenda,totalMn,aReceber};
  }

  const filtrados=clientes.filter(c=>c.status===aba)
    .filter(c=>c.nome.toLowerCase().includes(busca.toLowerCase())||c.cpf.includes(busca)||(c.instagram||"").includes(busca));

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <SectionTitle>👥 Clientes</SectionTitle>

      {/* FORMULÁRIO */}
      <Card>
        <h3 style={{margin:"0 0 13px",fontSize:14,color:C.blue,fontWeight:700}}>Novo Cliente</h3>
        {msg&&<Panel style={{marginBottom:10,fontSize:13,color:C.text}}>{msg}</Panel>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Input label="CPF"         value={form.cpf}       onChange={handleCPF}      placeholder="000.000.000-00"/>
          <Input label="NOME"        value={form.nome}      onChange={f("nome")}       placeholder="Nome completo"/>
          <Input label="TELEFONE"    value={form.telefone}  onChange={f("telefone")}   placeholder="(xx) 9xxxx-xxxx"/>
          <Input label="INSTAGRAM"   value={form.instagram} onChange={f("instagram")}  placeholder="@usuario"/>
          <Input label="CEP"         value={form.cep}       onChange={handleCEP}       placeholder="00000-000"/>
          <Input label="ENDEREÇO"    value={form.endereco}  onChange={f("endereco")}   placeholder="Rua, bairro, cidade"/>
        </div>
        <div style={{marginTop:12,display:"flex",gap:10,alignItems:"center"}}>
          <Btn onClick={salvar} disabled={loading}>💾 Salvar</Btn>
          {loading&&<span style={{color:C.muted,fontSize:12}}>Buscando...</span>}
        </div>
      </Card>

      {/* LISTA */}
      <Card>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13,flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",gap:7}}>
            <TabBtn active={aba==="ativo"} color={C.green} onClick={()=>setAba("ativo")}>✅ Ativos ({clientes.filter(c=>c.status==="ativo").length})</TabBtn>
            <TabBtn active={aba==="inadimplente"} color={C.red} onClick={()=>setAba("inadimplente")}>🚨 Inadimplentes ({clientes.filter(c=>c.status==="inadimplente").length})</TabBtn>
          </div>
          <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="🔍 Buscar..."
            style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:8,padding:"7px 12px",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit",width:180}}/>
        </div>

        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {filtrados.length===0&&<p style={{color:C.dim,fontSize:13}}>Nenhum cliente aqui.</p>}
          {filtrados.map(c=>{
            const {totalVenda,totalMn,aReceber}=perfilCliente(c);
            const isOpen=detalhe===c.id;
            return(
              <div key={c.id} style={{background:C.panel,borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
                {/* LINHA PRINCIPAL */}
                <div style={{padding:"11px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                  {confirmDelete===c.id?(
                    <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                      <p style={{margin:0,fontSize:13,color:C.red,fontWeight:700}}>⚠️ Excluir <strong>{c.nome}</strong>? Permanente.</p>
                      <Btn small color={C.red} onClick={()=>{setClientes(p=>p.filter(x=>x.id!==c.id));setConfirmDelete(null);}}>Confirmar</Btn>
                      <Btn small color={C.border} onClick={()=>setConfirmDelete(null)}>Cancelar</Btn>
                    </div>
                  ):(
                    <>
                      <div>
                        <p style={{margin:0,fontWeight:700,color:C.text,fontSize:14}}>{c.nome}</p>
                        <p style={{margin:"2px 0 0",fontSize:11,color:C.muted}}>{c.cpf} · {c.telefone}</p>
                        <div style={{display:"flex",gap:12,marginTop:4}}>
                          {aReceber>0&&<span style={{fontSize:11,color:C.blue,fontWeight:700}}>💰 {fmt(aReceber)} a receber</span>}
                          {totalVenda>0&&<span style={{fontSize:11,color:C.yellow,fontWeight:700}}>🛒 {fmt(totalVenda)} em compras</span>}
                          {totalMn>0&&<span style={{fontSize:11,color:C.purple,fontWeight:700}}>🔧 {fmt(totalMn)} em manutenção</span>}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:7,alignItems:"center",flexWrap:"wrap"}}>
                        <a href={`https://instagram.com/${(c.instagram||"").replace("@","")}`} target="_blank" rel="noreferrer" style={{color:C.pink,fontWeight:700,fontSize:12,textDecoration:"none"}}>{c.instagram} ↗</a>
                        <Btn small color={C.blue+"33"} style={{color:C.blue,border:`1px solid ${C.blue}44`}} onClick={()=>setDetalhe(isOpen?null:c.id)}>
                          {isOpen?"▲ Fechar":"👁 Ver perfil"}
                        </Btn>
                        {c.status==="ativo"
                          ?<Btn small color={C.border} style={{color:C.red,border:`1px solid ${C.red}44`}} onClick={()=>setClientes(p=>p.map(x=>x.id===c.id?{...x,status:"inadimplente"}:x))}>🚨</Btn>
                          :<Btn small color={C.border} style={{color:C.green,border:`1px solid ${C.green}44`}} onClick={()=>setClientes(p=>p.map(x=>x.id===c.id?{...x,status:"ativo"}:x))}>✅</Btn>}
                        <button onClick={()=>setConfirmDelete(c.id)} style={{background:"transparent",border:`1px solid ${C.red}33`,color:C.red,borderRadius:7,padding:"5px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>🗑</button>
                      </div>
                    </>
                  )}
                </div>
                {/* PERFIL EXPANDIDO */}
                {isOpen&&<PerfilCliente clienteId={c.id} vendas={vendas} manutencoes={manutencoes} contratos={contratos}/>}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function PerfilCliente({clienteId,vendas,manutencoes,contratos}){
  const vs=vendas.filter(v=>v.clienteId===clienteId);
  const ms=manutencoes.filter(m=>m.clienteId===clienteId);
  const cs=contratos.filter(c=>c.clienteId===clienteId);
  return(
    <div style={{borderTop:`1px solid ${C.border}`,padding:"13px 14px",display:"flex",flexDirection:"column",gap:12}}>
      {cs.length>0&&(
        <div>
          <p style={{margin:"0 0 7px",fontSize:12,color:C.muted,fontWeight:700,letterSpacing:".5px"}}>📄 CONTRATOS</p>
          {cs.map(c=>(
            <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:12,color:C.text}}>{c.produto}</span>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <span style={{fontSize:12,color:C.muted}}>{c.parcelasQuitadas}/{c.parcelas} parcelas</span>
                <Badge tipo={statusContrato(c)}/>
              </div>
            </div>
          ))}
        </div>
      )}
      {vs.length>0&&(
        <div>
          <p style={{margin:"0 0 7px",fontSize:12,color:C.muted,fontWeight:700,letterSpacing:".5px"}}>🛒 COMPRAS / PRODUTOS</p>
          {vs.map(v=>(
            <div key={v.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:12,color:C.text}}>{v.produto} ×{v.quantidade} <span style={{color:C.dim,fontSize:11}}>({v.categoria})</span></span>
              <span style={{fontSize:12,color:C.yellow,fontWeight:700}}>{fmt(v.total_venda)}</span>
            </div>
          ))}
        </div>
      )}
      {ms.length>0&&(
        <div>
          <p style={{margin:"0 0 7px",fontSize:12,color:C.muted,fontWeight:700,letterSpacing:".5px"}}>🔧 MANUTENÇÕES</p>
          {ms.map(m=>(
            <div key={m.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:12,color:C.text}}>{m.servico} <span style={{color:C.dim,fontSize:11}}>({m.data})</span></span>
              <span style={{fontSize:12,color:C.purple,fontWeight:700}}>{fmt(m.valor)}</span>
            </div>
          ))}
        </div>
      )}
      {vs.length===0&&ms.length===0&&cs.length===0&&<p style={{color:C.dim,fontSize:12,margin:0}}>Nenhuma movimentação ainda.</p>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// CONTRATOS
// ═══════════════════════════════════════════════════════════════
function Contratos({contratos,setContratos,clientes}){
  const [aba,setAba]=useState("ativo");
  const [form,setForm]=useState({clienteId:"",produto:"",valor:"",parcelas:"",vencimento:""});
  const [msg,setMsg]=useState("");
  const f=k=>v=>setForm(p=>({...p,[k]:v}));

  const abas=[
    {id:"ativo",label:"Ativos",color:C.blue},
    {id:"vence_breve",label:"Vence em breve",color:C.yellow},
    {id:"vencido",label:"Vencidos",color:C.red},
    {id:"quitado",label:"Quitados",color:C.green},
  ];

  function salvar(){
    const c=clientes.find(x=>x.id===Number(form.clienteId));
    if(!c||!form.produto||!form.valor) return setMsg("⚠️ Preencha todos os campos.");
    setContratos(p=>[...p,{...form,id:Date.now(),clienteNome:c.nome,instagram:c.instagram,valor:Number(form.valor),parcelas:Number(form.parcelas),parcelasQuitadas:0,status:"ativo"}]);
    setForm({clienteId:"",produto:"",valor:"",parcelas:"",vencimento:""});
    setMsg("✅ Contrato criado!"); setTimeout(()=>setMsg(""),3000);
  }
  function registrarPagamento(id){
    setContratos(p=>p.map(c=>{
      if(c.id!==id) return c;
      const novas=c.parcelasQuitadas+1;
      return{...c,parcelasQuitadas:novas,status:novas>=c.parcelas?"quitado":c.status};
    }));
  }

  const montante=montanteTotal(contratos);
  const filtrados=contratos.filter(c=>statusContrato(c)===aba);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <SectionTitle>📄 Contratos</SectionTitle>
      <Card style={{background:"linear-gradient(135deg,#0f1f3d,#1a1040)",border:`1px solid ${C.blue}33`}}>
        <p style={{margin:0,fontSize:11,color:C.muted,fontWeight:700,letterSpacing:".7px"}}>💰 MONTANTE TOTAL A RECEBER</p>
        <p style={{margin:"4px 0 0",fontSize:30,fontWeight:800,color:C.blue}}>{fmt(montante)}</p>
        <p style={{margin:"3px 0 0",fontSize:11,color:C.dim}}>Diminui a cada parcela paga — atualizado em tempo real</p>
      </Card>
      <Card>
        <h3 style={{margin:"0 0 13px",fontSize:14,color:C.blue,fontWeight:700}}>Novo Contrato</h3>
        {msg&&<Panel style={{marginBottom:10,fontSize:13,color:C.text}}>{msg}</Panel>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Sel label="CLIENTE" value={form.clienteId} onChange={f("clienteId")}><option value="">Selecione...</option>{clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</Sel>
          <Input label="PRODUTO" value={form.produto} onChange={f("produto")} placeholder="Ex: iPhone 14 Pro"/>
          <Input label="VALOR TOTAL (R$)" value={form.valor} onChange={f("valor")} type="number"/>
          <Input label="Nº PARCELAS" value={form.parcelas} onChange={f("parcelas")} type="number"/>
          <Input label="VENCIMENTO" value={form.vencimento} onChange={f("vencimento")} type="date"/>
        </div>
        <div style={{marginTop:12}}><Btn onClick={salvar}>💾 Criar Contrato</Btn></div>
      </Card>
      <Card>
        <div style={{display:"flex",gap:7,marginBottom:13,flexWrap:"wrap"}}>
          {abas.map(a=><TabBtn key={a.id} active={aba===a.id} color={a.color} onClick={()=>setAba(a.id)}>{a.label} ({contratos.filter(c=>statusContrato(c)===a.id).length})</TabBtn>)}
        </div>
        {aba==="quitado"&&<Panel style={{marginBottom:12,fontSize:12,color:C.green,border:`1px solid ${C.green}33`}}>💡 <strong>Oportunidade!</strong> Clientes que quitaram — hora de oferecer algo novo.</Panel>}
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {filtrados.length===0&&<p style={{color:C.dim,fontSize:13}}>Nenhum contrato aqui.</p>}
          {filtrados.map(c=>{
            const s=statusContrato(c),restam=c.parcelas-c.parcelasQuitadas,aRec=valorRestante(c);
            return(
              <Panel key={c.id}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                  <div>
                    <p style={{margin:0,fontWeight:800,color:C.text,fontSize:14}}>{c.clienteNome}</p>
                    <p style={{margin:"2px 0 0",fontSize:12,color:C.muted}}>{c.produto}</p>
                    <p style={{margin:"4px 0 0",fontSize:12,color:C.text}}>Total: {fmt(c.valor)} · Parcela: {fmt(c.valor/c.parcelas)} · {c.parcelasQuitadas}/{c.parcelas} pagas</p>
                    {restam>0&&<p style={{margin:"2px 0 0",fontSize:12,color:C.blue,fontWeight:700}}>A receber: {fmt(aRec)} ({restam} restantes)</p>}
                    <p style={{margin:"2px 0 0",fontSize:11,color:C.dim}}>Vencimento: {c.vencimento}</p>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:6,alignItems:"flex-end"}}>
                    <Badge tipo={s}/>
                    <a href={`https://instagram.com/${(c.instagram||"").replace("@","")}`} target="_blank" rel="noreferrer" style={{color:C.pink,fontSize:12,fontWeight:700,textDecoration:"none"}}>{c.instagram} ↗</a>
                  </div>
                </div>
                {s!=="quitado"&&restam>0&&(
                  <div style={{marginTop:9}}>
                    <Btn small color={C.green+"33"} style={{color:C.green,border:`1px solid ${C.green}44`}} onClick={()=>registrarPagamento(c.id)}>✅ Registrar pagamento de parcela</Btn>
                  </div>
                )}
              </Panel>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SELETOR DE CLIENTE — busca + cadastro rápido inline
// ═══════════════════════════════════════════════════════════════
function ClienteSelector({clientes, setClientes, value, onChange}){
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(false);
  const [modo, setModo] = useState("busca"); // "busca" | "novo"
  const [novoNome, setNovoNome] = useState("");
  const [novoTel, setNovoTel] = useState("");
  const [novoInsta, setNovoInsta] = useState("");

  const clienteSel = clientes.find(c => c.id === Number(value));
  const filtrados = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.instagram||"").toLowerCase().includes(busca.toLowerCase()) ||
    c.cpf.includes(busca)
  ).slice(0, 8);

  function selecionar(c){
    onChange(String(c.id));
    setBusca(""); setAberto(false);
  }

  function cadastrarRapido(){
    if(!novoNome.trim()) return;
    const novo = {id: Date.now(), cpf:"—", nome:novoNome.trim(), telefone:novoTel, instagram:novoInsta, cep:"", endereco:"", status:"ativo"};
    setClientes(p => [...p, novo]);
    onChange(String(novo.id));
    setNovoNome(""); setNovoTel(""); setNovoInsta("");
    setModo("busca"); setAberto(false);
  }

  return(
    <div style={{display:"flex",flexDirection:"column",gap:5,position:"relative"}}>
      <label style={{fontSize:11,color:C.muted,fontWeight:700,letterSpacing:".5px"}}>CLIENTE</label>

      {/* CAMPO PRINCIPAL */}
      <div onClick={()=>setAberto(p=>!p)} style={{background:C.panel,border:`1px solid ${aberto?C.blue:C.border}`,borderRadius:10,padding:"9px 13px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        {clienteSel
          ? <span style={{fontSize:13,color:C.text,fontWeight:600}}>{clienteSel.nome} <span style={{color:C.muted,fontSize:11}}>{clienteSel.instagram}</span></span>
          : <span style={{fontSize:13,color:C.dim}}>Selecionar cliente ou venda avulsa...</span>
        }
        <span style={{fontSize:11,color:C.muted}}>{aberto?"▲":"▼"}</span>
      </div>

      {/* DROPDOWN */}
      {aberto&&(
        <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:999,background:C.card,border:`1px solid ${C.blue}`,borderRadius:12,marginTop:4,boxShadow:"0 8px 32px #00000088",overflow:"hidden"}}>

          {/* TABS busca / novo */}
          <div style={{display:"flex",borderBottom:`1px solid ${C.border}`}}>
            <button onClick={()=>setModo("busca")} style={{flex:1,padding:"9px",background:modo==="busca"?C.blue+"22":"transparent",border:"none",color:modo==="busca"?C.blue:C.muted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🔍 Buscar cliente</button>
            <button onClick={()=>setModo("novo")} style={{flex:1,padding:"9px",background:modo==="novo"?C.green+"22":"transparent",border:"none",color:modo==="novo"?C.green:C.muted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>➕ Cadastrar novo</button>
          </div>

          {modo==="busca"&&(
            <div>
              {/* opção avulsa */}
              <div onClick={()=>{onChange("");setAberto(false);}} style={{padding:"9px 13px",cursor:"pointer",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:8}}
                onMouseEnter={e=>e.currentTarget.style.background=C.border}
                onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <span style={{fontSize:16}}>🏷️</span>
                <span style={{fontSize:13,color:C.muted,fontStyle:"italic"}}>Venda avulsa (sem cliente)</span>
              </div>

              <input
                autoFocus
                value={busca}
                onChange={e=>setBusca(e.target.value)}
                placeholder="Nome, Instagram ou CPF..."
                onClick={e=>e.stopPropagation()}
                style={{width:"100%",background:C.panel,border:"none",borderBottom:`1px solid ${C.border}`,padding:"9px 13px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}
              />

              <div style={{maxHeight:200,overflowY:"auto"}}>
                {filtrados.length===0&&(
                  <div style={{padding:"10px 13px"}}>
                    <p style={{margin:0,fontSize:12,color:C.dim}}>Nenhum cliente encontrado.</p>
                    <button onClick={()=>setModo("novo")} style={{marginTop:6,background:"transparent",border:"none",color:C.green,fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:700,padding:0}}>➕ Cadastrar novo cliente</button>
                  </div>
                )}
                {filtrados.map(c=>(
                  <div key={c.id} onClick={()=>selecionar(c)}
                    style={{padding:"9px 13px",cursor:"pointer",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}
                    onMouseEnter={e=>e.currentTarget.style.background=C.blue+"22"}
                    onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                    <div>
                      <p style={{margin:0,fontSize:13,fontWeight:700,color:C.text}}>{c.nome}</p>
                      <p style={{margin:0,fontSize:11,color:C.muted}}>{c.instagram} · {c.telefone}</p>
                    </div>
                    {c.status==="inadimplente"&&<span style={{fontSize:10,color:C.red,fontWeight:700,background:C.red+"22",padding:"2px 6px",borderRadius:8}}>INADIM.</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {modo==="novo"&&(
            <div style={{padding:"12px 14px",display:"flex",flexDirection:"column",gap:9}}>
              <p style={{margin:0,fontSize:12,color:C.muted}}>Cadastro rápido — complete o perfil depois em <strong style={{color:C.text}}>👥 Clientes</strong></p>
              <input value={novoNome} onChange={e=>setNovoNome(e.target.value)} placeholder="Nome completo *"
                style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}
                onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}/>
              <input value={novoTel} onChange={e=>setNovoTel(e.target.value)} placeholder="Telefone"
                style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}
                onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}/>
              <input value={novoInsta} onChange={e=>setNovoInsta(e.target.value)} placeholder="Instagram (ex: @usuario)"
                style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:9,padding:"9px 12px",color:C.text,fontSize:13,outline:"none",fontFamily:"inherit"}}
                onFocus={e=>e.target.style.borderColor=C.green} onBlur={e=>e.target.style.borderColor=C.border}/>
              <div style={{display:"flex",gap:8}}>
                <button onClick={cadastrarRapido} style={{background:C.green,color:"#fff",border:"none",borderRadius:9,padding:"8px 16px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✅ Cadastrar e selecionar</button>
                <button onClick={()=>setModo("busca")} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:9,padding:"8px 12px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Voltar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ESTOQUE — com venda/retirada inline
// ═══════════════════════════════════════════════════════════════
function Estoque({estoque,setEstoque,vendas,setVendas,clientes,setClientes}){
  const emptyProd={produto:"",categoria:"Celular",quantidade:"",preco_custo:"",preco_venda:"",imei:""};
  const [formProd,setFormProd]=useState(emptyProd);
  const [msg,setMsg]=useState("");
  const [filtroCat,setFiltroCat]=useState("Todos");
  const [acaoItem,setAcaoItem]=useState(null);
  const [formVenda,setFormVenda]=useState({clienteId:"",quantidade:"1",preco_venda:"",data:hoje,motivoRetirada:""});
  const fp=k=>v=>setFormProd(p=>({...p,[k]:v}));
  const fv=k=>v=>setFormVenda(p=>({...p,[k]:v}));

  function salvarProd(){
    if(!formProd.produto) return setMsg("⚠️ Informe o produto.");
    setEstoque(p=>[...p,{...formProd,id:Date.now(),quantidade:Number(formProd.quantidade),preco_custo:Number(formProd.preco_custo),preco_venda:Number(formProd.preco_venda)}]);
    setFormProd(emptyProd); setMsg("✅ Adicionado!"); setTimeout(()=>setMsg(""),3000);
  }

  function abrirAcao(id,modo){
    const item=estoque.find(e=>e.id===id);
    setFormVenda({clienteId:"",quantidade:"1",preco_venda:String(item?.preco_venda||""),data:hoje,motivoRetirada:""});
    setAcaoItem({id,modo});
    // scroll suave até o topo da ação
    setTimeout(()=>document.getElementById("acao-venda")?.scrollIntoView({behavior:"smooth",block:"start"}),50);
  }

  function confirmarVenda(){
    const item=estoque.find(e=>e.id===acaoItem.id);
    const qtd=Number(formVenda.quantidade)||1;
    if(qtd>item.quantidade) return setMsg("⚠️ Quantidade maior que o estoque disponível!");
    if(acaoItem.modo==="vender"){
      const c=clientes.find(x=>x.id===Number(formVenda.clienteId));
      const pv=Number(formVenda.preco_venda)||item.preco_venda;
      setVendas(p=>[...p,{
        id:Date.now(),clienteId:c?c.id:0,clienteNome:c?c.nome:"Venda avulsa",
        estoqueId:item.id,produto:item.produto,categoria:item.categoria,
        quantidade:qtd,preco_custo:item.preco_custo,preco_venda:pv,
        total_venda:qtd*pv,total_custo:qtd*item.preco_custo,data:formVenda.data
      }]);
    }
    setEstoque(p=>p.map(e=>e.id===acaoItem.id?{...e,quantidade:e.quantidade-qtd}:e));
    setAcaoItem(null);
    setMsg(acaoItem.modo==="vender"?"✅ Venda registrada e estoque atualizado!":"✅ Retirada registrada!");
    setTimeout(()=>setMsg(""),3000);
  }

  const cats=["Todos",...new Set(estoque.map(e=>e.categoria))];
  const filtrados=filtroCat==="Todos"?estoque:estoque.filter(e=>e.categoria===filtroCat);
  const totalVenda=estoque.reduce((a,b)=>a+b.quantidade*b.preco_venda,0);
  const totalCusto=estoque.reduce((a,b)=>a+b.quantidade*b.preco_custo,0);
  const totalItens=estoque.reduce((a,b)=>a+b.quantidade,0);

  const itemAcao=acaoItem?estoque.find(e=>e.id===acaoItem.id):null;
  const qtdDisp=itemAcao?.quantidade||0;
  const pvAtual=Number(formVenda.preco_venda)||itemAcao?.preco_venda||0;
  const qtdSel=Number(formVenda.quantidade)||1;
  const lucroPreview=qtdSel*(pvAtual-(itemAcao?.preco_custo||0));

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <SectionTitle>📦 Estoque</SectionTitle>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:11}}>
        <Stat icon="💵" label="Valor de venda"    value={fmt(totalVenda)}            color={C.green}/>
        <Stat icon="💸" label="Custo total"        value={fmt(totalCusto)}            color={C.red}/>
        <Stat icon="📈" label="Margem potencial"   value={fmt(totalVenda-totalCusto)} color={C.blue}/>
        <Stat icon="📦" label="Total de itens"     value={`${totalItens} un.`}       color={C.yellow}/>
        <Stat icon="🚨" label="Zerados"            value={estoque.filter(e=>e.quantidade===0).length} color={estoque.filter(e=>e.quantidade===0).length>0?C.red:C.green}/>
      </div>

      {/* PAINEL DE AÇÃO — VENDER / RETIRAR */}
      {acaoItem&&itemAcao&&(
        <Card id="acao-venda" style={{border:`2px solid ${acaoItem.modo==="vender"?C.green:C.yellow}66`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <h3 style={{margin:0,fontSize:15,color:acaoItem.modo==="vender"?C.green:C.yellow,fontWeight:800}}>
                {acaoItem.modo==="vender"?"🛒 Registrar Venda":"📤 Retirar do Estoque"}
              </h3>
              <p style={{margin:"3px 0 0",fontSize:13,color:C.text,fontWeight:600}}>{itemAcao.produto}</p>
              <p style={{margin:"2px 0 0",fontSize:12,color:C.muted}}>
                Disponível: <strong style={{color:C.text}}>{qtdDisp} un.</strong>
                &nbsp;· Custo unit.: <strong style={{color:C.red}}>{fmt(itemAcao.preco_custo)}</strong>
                &nbsp;· Preço padrão: <strong style={{color:C.green}}>{fmt(itemAcao.preco_venda)}</strong>
              </p>
            </div>
            <button onClick={()=>setAcaoItem(null)} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,borderRadius:7,padding:"5px 12px",cursor:"pointer",fontFamily:"inherit",fontSize:13}}>✕ Fechar</button>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {/* SELETOR DE CLIENTE CUSTOMIZADO */}
            {acaoItem.modo==="vender"&&(
              <ClienteSelector
                clientes={clientes}
                setClientes={setClientes}
                value={formVenda.clienteId}
                onChange={v=>fv("clienteId")(v)}
              />
            )}

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Input label="QUANTIDADE" value={formVenda.quantidade} onChange={fv("quantidade")} type="number"/>
              {acaoItem.modo==="vender"&&(
                <Input label="PREÇO DE VENDA (R$)" value={formVenda.preco_venda} onChange={fv("preco_venda")} type="number"/>
              )}
              {acaoItem.modo==="retirar"&&(
                <Input label="MOTIVO DA RETIRADA" value={formVenda.motivoRetirada} onChange={fv("motivoRetirada")} placeholder="Ex: defeito, devolução..."/>
              )}
              <Input label="DATA" value={formVenda.data} onChange={fv("data")} type="date"/>
            </div>

            {/* PREVIEW DO LUCRO */}
            {acaoItem.modo==="vender"&&pvAtual>0&&(
              <Panel style={{fontSize:12,color:C.muted,display:"flex",gap:20,flexWrap:"wrap"}}>
                <span>Total: <strong style={{color:C.green,fontSize:14}}>{fmt(qtdSel*pvAtual)}</strong></span>
                <span>Lucro: <strong style={{color:lucroPreview>=0?C.blue:C.red}}>{fmt(lucroPreview)}</strong></span>
                <span>Margem: <strong style={{color:C.blue}}>{pvAtual>0?Math.round((lucroPreview/(qtdSel*pvAtual))*100):0}%</strong></span>
                {formVenda.clienteId&&<span>Cliente: <strong style={{color:C.text}}>{clientes.find(c=>c.id===Number(formVenda.clienteId))?.nome}</strong></span>}
              </Panel>
            )}

            <div style={{display:"flex",gap:8}}>
              <Btn onClick={confirmarVenda} color={acaoItem.modo==="vender"?C.green:C.yellow}>
                {acaoItem.modo==="vender"?"💾 Confirmar Venda":"💾 Confirmar Retirada"}
              </Btn>
              <Btn onClick={()=>setAcaoItem(null)} color={C.border} style={{color:C.muted}}>Cancelar</Btn>
            </div>
          </div>
        </Card>
      )}

      {msg&&<Panel style={{fontSize:13,color:C.text}}>{msg}</Panel>}

      {/* ADD PRODUTO */}
      <Card>
        <h3 style={{margin:"0 0 13px",fontSize:14,color:C.blue,fontWeight:700}}>Adicionar Produto ao Estoque</h3>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Input label="PRODUTO" value={formProd.produto} onChange={fp("produto")} placeholder="Ex: iPhone 15 Pro"/>
          <Sel label="CATEGORIA" value={formProd.categoria} onChange={fp("categoria")}>
            {["Celular","Acessório","Tablet","Outro"].map(c=><option key={c} value={c}>{c}</option>)}
          </Sel>
          <Input label="QUANTIDADE" value={formProd.quantidade} onChange={fp("quantidade")} type="number"/>
          <Input label="IMEI (opcional)" value={formProd.imei} onChange={fp("imei")} placeholder="—"/>
          <Input label="PREÇO DE CUSTO (R$)" value={formProd.preco_custo} onChange={fp("preco_custo")} type="number"/>
          <Input label="PREÇO DE VENDA (R$)" value={formProd.preco_venda} onChange={fp("preco_venda")} type="number"/>
        </div>
        <div style={{marginTop:12}}><Btn onClick={salvarProd}>💾 Adicionar ao Estoque</Btn></div>
      </Card>

      {/* LISTA DE PRODUTOS */}
      <Card>
        <div style={{display:"flex",gap:7,marginBottom:13,flexWrap:"wrap"}}>
          {cats.map(c=><TabBtn key={c} active={filtroCat===c} onClick={()=>setFiltroCat(c)}>{c}</TabBtn>)}
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:9}}>
          {filtrados.map(p=>{
            const margem=p.preco_custo>0?Math.round(((p.preco_venda-p.preco_custo)/p.preco_venda)*100):0;
            const statusCor=p.quantidade===0?C.red:p.quantidade<=2?C.yellow:C.green;
            return(
              <Panel key={p.id} style={{border:`1px solid ${statusCor}22`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:4}}>
                      <p style={{margin:0,fontWeight:700,fontSize:14,color:C.text}}>{p.produto}</p>
                      <span style={{background:statusCor+"22",color:statusCor,border:`1px solid ${statusCor}44`,padding:"1px 8px",borderRadius:12,fontSize:11,fontWeight:700}}>{p.quantidade} un.</span>
                      <span style={{background:C.border,color:C.muted,padding:"1px 8px",borderRadius:12,fontSize:11}}>{p.categoria}</span>
                    </div>
                    <div style={{display:"flex",gap:16,alignItems:"center"}}>
                      <div>
                        <span style={{fontSize:12,color:C.green,fontWeight:700}}>Venda: {fmt(p.preco_venda)}</span>
                        <span style={{fontSize:11,color:C.muted,marginLeft:8}}>Custo: {fmt(p.preco_custo)}</span>
                        <span style={{fontSize:11,color:C.blue,marginLeft:8}}>Margem: {margem}%</span>
                      </div>
                    </div>
                    {/* mini barra de margem */}
                    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}}>
                      <MiniBar value={margem} max={100} color={margem>=40?C.green:margem>=20?C.yellow:C.red}/>
                      <span style={{fontSize:10,color:C.muted,whiteSpace:"nowrap"}}>{margem}% margem</span>
                    </div>
                    {p.imei&&p.imei!=="—"&&<p style={{margin:"4px 0 0",fontSize:10,color:C.dim}}>IMEI: {p.imei}</p>}
                  </div>
                  <div style={{display:"flex",gap:7,flexShrink:0}}>
                    <Btn small color={C.green+"33"} style={{color:C.green,border:`1px solid ${C.green}44`}}
                      disabled={p.quantidade===0} onClick={()=>abrirAcao(p.id,"vender")}>🛒 Vender</Btn>
                    <Btn small color={C.yellow+"33"} style={{color:C.yellow,border:`1px solid ${C.yellow}44`}}
                      disabled={p.quantidade===0} onClick={()=>abrirAcao(p.id,"retirar")}>📤 Retirar</Btn>
                  </div>
                </div>
              </Panel>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// VENDAS — histórico + por cliente
// ═══════════════════════════════════════════════════════════════
function Vendas({vendas,setVendas,clientes,estoque,setEstoque}){
  const [aba,setAba]=useState("historico");
  const [busca,setBusca]=useState("");

  const totalMes=vendas.filter(v=>v.data.startsWith(mesAtual)).reduce((a,b)=>a+b.total_venda,0);
  const custoMes=vendas.filter(v=>v.data.startsWith(mesAtual)).reduce((a,b)=>a+b.total_custo,0);
  const totalAno=vendas.reduce((a,b)=>a+b.total_venda,0);
  const lucroAno=vendas.reduce((a,b)=>a+b.total_venda-b.total_custo,0);

  // agrupado por cliente
  const porCliente=useMemo(()=>{
    const m={};
    vendas.forEach(v=>{
      if(!m[v.clienteNome]) m[v.clienteNome]={nome:v.clienteNome,itens:[],total:0,lucro:0};
      m[v.clienteNome].itens.push(v);
      m[v.clienteNome].total+=v.total_venda;
      m[v.clienteNome].lucro+=v.total_venda-v.total_custo;
    });
    return Object.values(m).sort((a,b)=>b.total-a.total);
  },[vendas]);

  const filtradosHistorico=[...vendas].reverse().filter(v=>
    v.clienteNome.toLowerCase().includes(busca.toLowerCase())||
    v.produto.toLowerCase().includes(busca.toLowerCase())
  );

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <SectionTitle>🛒 Vendas</SectionTitle>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:11}}>
        <Stat icon="🛒" label="Vendas este mês" value={fmt(totalMes)} color={C.yellow}/>
        <Stat icon="💸" label="Custo este mês"  value={fmt(custoMes)} color={C.red}/>
        <Stat icon="💰" label="Lucro este mês"  value={fmt(totalMes-custoMes)} color={C.green}/>
        <Stat icon="📅" label="Vendas no ano"   value={fmt(totalAno)} color={C.blue}/>
        <Stat icon="📈" label="Lucro no ano"    value={fmt(lucroAno)} color={C.purple}/>
      </div>

      <Panel style={{fontSize:12,color:C.muted,background:C.blue+"11",border:`1px solid ${C.blue}22`}}>
        💡 Para registrar uma nova venda, vá até <strong style={{color:C.text}}>📦 Estoque</strong> e clique em <strong style={{color:C.green}}>🛒 Vender</strong> no produto. O estoque é atualizado automaticamente.
      </Panel>

      <div style={{display:"flex",gap:7,marginBottom:0}}>
        <TabBtn active={aba==="historico"} onClick={()=>setAba("historico")}>📋 Histórico</TabBtn>
        <TabBtn active={aba==="porcliente"} color={C.yellow} onClick={()=>setAba("porcliente")}>👤 Por Cliente</TabBtn>
      </div>

      {aba==="historico"&&(
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <h3 style={{margin:0,fontSize:14,fontWeight:700,color:C.text}}>Todas as Vendas</h3>
            <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="🔍 Buscar..."
              style={{background:C.panel,border:`1px solid ${C.border}`,borderRadius:8,padding:"6px 11px",color:C.text,fontSize:12,outline:"none",fontFamily:"inherit",width:170}}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {filtradosHistorico.length===0&&<p style={{color:C.dim,fontSize:13}}>Nenhuma venda.</p>}
            {filtradosHistorico.map(v=>(
              <Panel key={v.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
                <div>
                  <p style={{margin:0,fontWeight:700,fontSize:13,color:C.text}}>{v.produto} <span style={{color:C.muted,fontSize:11}}>×{v.quantidade}</span></p>
                  <p style={{margin:"2px 0 0",fontSize:11,color:C.muted}}>{v.clienteNome} · {v.categoria} · {v.data}</p>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{margin:0,fontSize:13,color:C.green,fontWeight:700}}>{fmt(v.total_venda)}</p>
                  <p style={{margin:0,fontSize:11,color:C.dim}}>Custo: {fmt(v.total_custo)} · Lucro: {fmt(v.total_venda-v.total_custo)}</p>
                </div>
              </Panel>
            ))}
          </div>
        </Card>
      )}

      {aba==="porcliente"&&(
        <Card>
          <h3 style={{margin:"0 0 12px",fontSize:14,fontWeight:700,color:C.text}}>O que cada cliente comprou</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {porCliente.length===0&&<p style={{color:C.dim,fontSize:13}}>Nenhuma venda ainda.</p>}
            {porCliente.map((grupo,gi)=>(
              <div key={grupo.nome} style={{background:C.panel,borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
                <div style={{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",background:gi===0?C.yellow+"11":"transparent"}}>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:16}}>{gi===0?"🥇":gi===1?"🥈":gi===2?"🥉":"👤"}</span>
                    <div>
                      <p style={{margin:0,fontWeight:700,fontSize:14,color:C.text}}>{grupo.nome}</p>
                      <p style={{margin:0,fontSize:11,color:C.muted}}>{grupo.itens.length} produto(s) comprado(s)</p>
                    </div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{margin:0,fontSize:14,color:C.yellow,fontWeight:800}}>{fmt(grupo.total)}</p>
                    <p style={{margin:0,fontSize:11,color:C.green}}>Lucro: {fmt(grupo.lucro)}</p>
                  </div>
                </div>
                <div style={{padding:"8px 14px 12px"}}>
                  {grupo.itens.map(v=>(
                    <div key={v.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${C.border}`}}>
                      <span style={{fontSize:12,color:C.text}}>{v.produto} <span style={{color:C.muted}}>×{v.quantidade}</span> <span style={{color:C.dim,fontSize:11}}>({v.categoria})</span></span>
                      <span style={{fontSize:12,color:C.yellow,fontWeight:700}}>{fmt(v.total_venda)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MANUTENÇÃO
// ═══════════════════════════════════════════════════════════════
function Manutencao({manutencoes,setManutencoes,clientes}){
  const empty={clienteId:"",servico:"",valor:"",custo_peca:"",custo_tecnico:"",data:hoje,categoria:"Tela"};
  const [form,setForm]=useState(empty);
  const [msg,setMsg]=useState("");
  const f=k=>v=>setForm(p=>({...p,[k]:v}));

  function salvar(){
    const c=clientes.find(x=>x.id===Number(form.clienteId));
    if(!c||!form.servico||!form.valor) return setMsg("⚠️ Preencha os campos obrigatórios.");
    setManutencoes(p=>[...p,{...form,id:Date.now(),clienteNome:c.nome,valor:Number(form.valor),custo_peca:Number(form.custo_peca||0),custo_tecnico:Number(form.custo_tecnico||0)}]);
    setForm(empty); setMsg("✅ Registrada!"); setTimeout(()=>setMsg(""),3000);
  }

  const mn=manutencoes.filter(m=>m.data.startsWith(mesAtual));
  const recMes=mn.reduce((a,b)=>a+b.valor,0),pecaMes=mn.reduce((a,b)=>a+(b.custo_peca||0),0),tecMes=mn.reduce((a,b)=>a+(b.custo_tecnico||0),0);
  const recAno=manutencoes.reduce((a,b)=>a+b.valor,0),pecaAno=manutencoes.reduce((a,b)=>a+(b.custo_peca||0),0),tecAno=manutencoes.reduce((a,b)=>a+(b.custo_tecnico||0),0);
  const rankCat={};
  manutencoes.forEach(m=>{rankCat[m.categoria]=(rankCat[m.categoria]||0)+m.valor;});
  const cats=Object.entries(rankCat).sort((a,b)=>b[1]-a[1]);

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <SectionTitle>🔧 Manutenção</SectionTitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(148px,1fr))",gap:11}}>
        <Stat icon="📥" label="Receita/mês"  value={fmt(recMes)}                color={C.purple}/>
        <Stat icon="🔩" label="Peças/mês"    value={fmt(pecaMes)}               color={C.red}/>
        <Stat icon="👨‍🔧" label="Técnico/mês" value={fmt(tecMes)}                color={C.yellow}/>
        <Stat icon="💰" label="Lucro/mês"    value={fmt(recMes-pecaMes-tecMes)} color={C.green}/>
      </div>
      <Card>
        <h3 style={{margin:"0 0 10px",fontSize:12,color:C.muted,fontWeight:700}}>ACUMULADO NO ANO</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:9}}>
          {[["Receita",recAno,C.purple],["Peças",pecaAno,C.red],["Técnico",tecAno,C.yellow],["Lucro",recAno-pecaAno-tecAno,C.green]].map(([l,v,c])=>(
            <Panel key={l}><p style={{margin:0,fontSize:10,color:C.muted,fontWeight:600}}>{l}</p><p style={{margin:"3px 0 0",fontSize:15,fontWeight:800,color:c}}>{fmt(v)}</p></Panel>
          ))}
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        <Card>
          <h3 style={{margin:"0 0 12px",fontSize:14,color:C.purple,fontWeight:700}}>Por Categoria</h3>
          {cats.map(([cat,val])=>(
            <div key={cat} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
              <span style={{fontSize:13,color:C.text}}>{cat}</span>
              <span style={{fontSize:13,color:C.green,fontWeight:700}}>{fmt(val)}</span>
            </div>
          ))}
        </Card>
        <Card>
          <h3 style={{margin:"0 0 12px",fontSize:14,color:C.blue,fontWeight:700}}>Registrar Serviço</h3>
          {msg&&<Panel style={{marginBottom:10,fontSize:13,color:C.text}}>{msg}</Panel>}
          <div style={{display:"flex",flexDirection:"column",gap:9}}>
            <Sel label="CLIENTE" value={form.clienteId} onChange={f("clienteId")}><option value="">Selecione...</option>{clientes.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</Sel>
            <Input label="SERVIÇO *" value={form.servico} onChange={f("servico")} placeholder="Ex: Troca de tela"/>
            <Sel label="CATEGORIA" value={form.categoria} onChange={f("categoria")}>{["Tela","Bateria","Conector","Câmera","Software","Outro"].map(c=><option key={c} value={c}>{c}</option>)}</Sel>
            <Input label="COBRADO DO CLIENTE (R$) *" value={form.valor} onChange={f("valor")} type="number"/>
            <Input label="CUSTO DA PEÇA (R$)" value={form.custo_peca} onChange={f("custo_peca")} placeholder="0,00" type="number"/>
            <Input label="MÃO DE OBRA / TÉCNICO (R$)" value={form.custo_tecnico} onChange={f("custo_tecnico")} placeholder="0,00" type="number"/>
            {form.valor&&<Panel style={{fontSize:12,color:C.muted}}>Lucro da OS: <strong style={{color:C.green}}>{fmt(Number(form.valor)-Number(form.custo_peca||0)-Number(form.custo_tecnico||0))}</strong></Panel>}
            <Input label="DATA" value={form.data} onChange={f("data")} type="date"/>
            <Btn onClick={salvar}>💾 Registrar</Btn>
          </div>
        </Card>
      </div>
      <Card>
        <h3 style={{margin:"0 0 12px",fontSize:14,fontWeight:700,color:C.text}}>Histórico</h3>
        <div style={{display:"flex",flexDirection:"column",gap:7}}>
          {[...manutencoes].reverse().map(m=>(
            <Panel key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
              <div>
                <p style={{margin:0,fontWeight:700,fontSize:13,color:C.text}}>{m.clienteNome}</p>
                <p style={{margin:"2px 0 0",fontSize:11,color:C.muted}}>{m.servico} · {m.categoria} · {m.data}</p>
                <p style={{margin:"2px 0 0",fontSize:11,color:C.dim}}>Peça: {fmt(m.custo_peca||0)} · Técnico: {fmt(m.custo_tecnico||0)}</p>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{margin:0,fontSize:14,fontWeight:800,color:C.green}}>{fmt(m.valor)}</p>
                <p style={{margin:0,fontSize:11,color:C.blue}}>Lucro: {fmt(m.valor-(m.custo_peca||0)-(m.custo_tecnico||0))}</p>
              </div>
            </Panel>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COBRANÇA
// ═══════════════════════════════════════════════════════════════
function Cobranca({contratos}){
  function gerarMensagem(c){
    return`Olá ${c.clienteNome}! 😊 Passando para lembrar que sua parcela referente ao *${c.produto}* vence em *${c.vencimento}*. Valor: *${fmt(c.valor/c.parcelas)}*. Qualquer dúvida, estou à disposição! 🙏 — Gambira.Com`;
  }
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <SectionTitle>💬 Cobrança</SectionTitle>
      <Panel style={{fontSize:12,color:C.muted,border:`1px solid ${C.green}33`,lineHeight:1.7}}>⚙️ <strong style={{color:C.green}}>Cobrança Automática</strong> — Mensagem personalizada por cliente. Copie e envie no Instagram. Em breve: integração com Instagram DM API.</Panel>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {contratos.filter(c=>statusContrato(c)!=="quitado").map(c=>{
          const s=statusContrato(c),dias=diasPara(c.vencimento);
          return(
            <Card key={c.id}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
                <div>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:5}}><p style={{margin:0,fontWeight:800,fontSize:14,color:C.text}}>{c.clienteNome}</p><Badge tipo={s}/></div>
                  <p style={{margin:0,fontSize:12,color:C.muted}}>{c.produto} · Vence: {c.vencimento} {dias>=0?`(em ${dias} dias)`:`(${Math.abs(dias)} dias atrás)`}</p>
                </div>
                <a href={`https://instagram.com/${(c.instagram||"").replace("@","")}`} target="_blank" rel="noreferrer" style={{color:C.pink,fontWeight:700,fontSize:12,textDecoration:"none"}}>{c.instagram} ↗</a>
              </div>
              <Panel style={{marginTop:10}}>
                <p style={{margin:"0 0 5px",fontSize:11,color:C.muted,fontWeight:700}}>💬 MENSAGEM</p>
                <p style={{margin:0,fontSize:12,color:C.text,lineHeight:1.7}}>{gerarMensagem(c)}</p>
              </Panel>
              <div style={{marginTop:9}}><Btn small color={C.border} style={{color:C.muted}} onClick={()=>navigator.clipboard.writeText(gerarMensagem(c))}>📋 Copiar mensagem</Btn></div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FINANCEIRO
// ═══════════════════════════════════════════════════════════════
function Financeiro({contratos,manutencoes,vendas}){
  const [periodo,setPeriodo]=useState("mes");
  const filtro=v=>periodo==="mes"?v.data?.startsWith(mesAtual):v.data?.startsWith(anoAtual);
  const lbl=periodo==="mes"?"Mês Atual":"Ano Atual";
  const mnF=manutencoes.filter(filtro),vdF=vendas.filter(filtro);
  const recMn=mnF.reduce((a,b)=>a+b.valor,0),recVd=vdF.reduce((a,b)=>a+b.total_venda,0);
  const pecas=mnF.reduce((a,b)=>a+(b.custo_peca||0),0),tec=mnF.reduce((a,b)=>a+(b.custo_tecnico||0),0);
  const cVd=vdF.reduce((a,b)=>a+b.total_custo,0);
  const totalEnt=recMn+recVd,totalSai=pecas+tec+cVd,lucro=totalEnt-totalSai;
  const montante=montanteTotal(contratos);
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
        <SectionTitle>💰 Financeiro</SectionTitle>
        <div style={{display:"flex",gap:7}}><TabBtn active={periodo==="mes"} onClick={()=>setPeriodo("mes")}>Mês Atual</TabBtn><TabBtn active={periodo==="ano"} onClick={()=>setPeriodo("ano")}>Ano Atual</TabBtn></div>
      </div>
      <Card style={{background:"linear-gradient(135deg,#0f1f3d,#1a1040)",border:`1px solid ${C.blue}33`}}>
        <p style={{margin:0,fontSize:11,color:C.muted,fontWeight:700,letterSpacing:".7px"}}>💰 MONTANTE TOTAL A RECEBER (parcelas futuras)</p>
        <p style={{margin:"4px 0 0",fontSize:34,fontWeight:800,color:C.blue}}>{fmt(montante)}</p>
        <p style={{margin:"4px 0 0",fontSize:11,color:C.dim}}>Atualizado em tempo real</p>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:11}}>
        <Stat icon="📥" label={`Entradas — ${lbl}`} value={fmt(totalEnt)} color={C.green}/>
        <Stat icon="📤" label={`Saídas — ${lbl}`}   value={fmt(totalSai)} color={C.red}/>
        <Stat icon="💵" label={`Lucro — ${lbl}`}     value={fmt(lucro)}   color={lucro>=0?C.green:C.red}/>
      </div>
      <Card>
        <h3 style={{margin:"0 0 12px",fontSize:14,color:C.green,fontWeight:700}}>📥 Entradas — {lbl}</h3>
        <Row label="Manutenções cobradas" value={fmt(recMn)} color={C.purple}/>
        <Row label="Vendas (aparelhos + acessórios)" value={fmt(recVd)} color={C.yellow}/>
        <div style={{display:"flex",justifyContent:"space-between",paddingTop:9}}><span style={{fontSize:13,fontWeight:800,color:C.text}}>TOTAL ENTRADAS</span><span style={{fontSize:14,fontWeight:800,color:C.green}}>{fmt(totalEnt)}</span></div>
      </Card>
      <Card>
        <h3 style={{margin:"0 0 12px",fontSize:14,color:C.red,fontWeight:700}}>📤 Saídas — {lbl}</h3>
        <Row label="Peças (manutenção)"         value={fmt(pecas)} color={C.red}/>
        <Row label="Técnico / mão de obra"      value={fmt(tec)}   color={C.yellow}/>
        <Row label="Custo dos produtos vendidos" value={fmt(cVd)}  color={C.red}/>
        <div style={{display:"flex",justifyContent:"space-between",paddingTop:9}}><span style={{fontSize:13,fontWeight:800,color:C.text}}>TOTAL SAÍDAS</span><span style={{fontSize:14,fontWeight:800,color:C.red}}>{fmt(totalSai)}</span></div>
      </Card>
      <Card style={{borderColor:lucro>=0?C.green+"44":C.red+"44"}}>
        <p style={{margin:0,fontSize:11,color:C.muted,fontWeight:700,letterSpacing:".6px"}}>RESULTADO {lbl.toUpperCase()}</p>
        <p style={{margin:"4px 0 0",fontSize:32,fontWeight:800,color:lucro>=0?C.green:C.red}}>{fmt(lucro)}</p>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// INTELIGÊNCIA DE NEGÓCIO
// ═══════════════════════════════════════════════════════════════
function Inteligencia({vendas,manutencoes,contratos,clientes,estoque}){
  const [aba,setAba]=useState("produtos");

  // ── ANÁLISE DE PRODUTOS ──
  const analProdutos=useMemo(()=>{
    const m={};
    vendas.forEach(v=>{
      if(!m[v.produto]) m[v.produto]={produto:v.produto,categoria:v.categoria,qtd:0,receita:0,custo:0,lucro:0,vendas:0};
      m[v.produto].qtd+=v.quantidade;
      m[v.produto].receita+=v.total_venda;
      m[v.produto].custo+=v.total_custo;
      m[v.produto].lucro+=v.total_venda-v.total_custo;
      m[v.produto].vendas+=1;
    });
    return Object.values(m).sort((a,b)=>b.receita-a.receita);
  },[vendas]);

  // ── ANÁLISE DE CLIENTES ──
  const analClientes=useMemo(()=>{
    const m={};
    clientes.forEach(c=>{
      m[c.id]={id:c.id,nome:c.nome,instagram:c.instagram,status:c.status,
        totalVendas:0,totalMn:0,aReceber:0,qtdCompras:0,qtdManutencoes:0,produtos:[]};
    });
    vendas.forEach(v=>{
      if(m[v.clienteId]){m[v.clienteId].totalVendas+=v.total_venda;m[v.clienteId].qtdCompras+=v.quantidade;m[v.clienteId].produtos.push(v.produto);}
    });
    manutencoes.forEach(mn=>{
      if(m[mn.clienteId]){m[mn.clienteId].totalMn+=mn.valor;m[mn.clienteId].qtdManutencoes+=1;}
    });
    contratos.forEach(c=>{
      if(m[c.clienteId]) m[c.clienteId].aReceber+=valorRestante(c);
    });
    return Object.values(m).sort((a,b)=>(b.totalVendas+b.totalMn)-(a.totalVendas+a.totalMn));
  },[clientes,vendas,manutencoes,contratos]);

  // ── ANÁLISE POR CATEGORIA ──
  const analCategorias=useMemo(()=>{
    const m={};
    vendas.forEach(v=>{
      if(!m[v.categoria]) m[v.categoria]={cat:v.categoria,qtd:0,receita:0,lucro:0};
      m[v.categoria].qtd+=v.quantidade;
      m[v.categoria].receita+=v.total_venda;
      m[v.categoria].lucro+=v.total_venda-v.total_custo;
    });
    return Object.values(m).sort((a,b)=>b.receita-a.receita);
  },[vendas]);

  // ── PRODUTOS COM MAIOR MARGEM ──
  const maisMargem=useMemo(()=>{
    return estoque.map(e=>({
      ...e,
      margem:e.preco_venda>0?((e.preco_venda-e.preco_custo)/e.preco_venda*100).toFixed(1):0,
      lucroUnit:e.preco_venda-e.preco_custo
    })).sort((a,b)=>Number(b.margem)-Number(a.margem));
  },[estoque]);

  const maxRec=Math.max(...analProdutos.map(p=>p.receita),1);
  const maxCat=Math.max(...analCategorias.map(c=>c.receita),1);
  const medal=["🥇","🥈","🥉","4°","5°","6°","7°","8°"];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:20}}>
      <div>
        <SectionTitle>🧠 Inteligência de Negócio</SectionTitle>
        <p style={{margin:"4px 0 0",color:C.muted,fontSize:12}}>Tudo que você precisa saber para tomar as melhores decisões</p>
      </div>

      <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
        <TabBtn active={aba==="produtos"}   onClick={()=>setAba("produtos")}>📦 Produtos</TabBtn>
        <TabBtn active={aba==="margem"}    color={C.green} onClick={()=>setAba("margem")}>📈 Maior Margem</TabBtn>
        <TabBtn active={aba==="categorias"} color={C.yellow} onClick={()=>setAba("categorias")}>🗂 Categorias</TabBtn>
        <TabBtn active={aba==="clientes"}  color={C.purple} onClick={()=>setAba("clientes")}>👑 Ranking Clientes</TabBtn>
        <TabBtn active={aba==="contratos"} color={C.blue} onClick={()=>setAba("contratos")}>📊 Contratos</TabBtn>
      </div>

      {/* ── PRODUTOS MAIS VENDIDOS ── */}
      {aba==="produtos"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <h3 style={{margin:"0 0 14px",fontSize:14,color:C.text,fontWeight:700}}>📦 Produtos — Receita, Lucro & Quantidade</h3>
            {analProdutos.length===0&&<p style={{color:C.dim,fontSize:13}}>Nenhuma venda registrada.</p>}
            {analProdutos.map((p,i)=>{
              const margPct=p.receita>0?Math.round((p.lucro/p.receita)*100):0;
              return(
                <div key={p.produto} style={{padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div>
                      <p style={{margin:0,fontSize:13,fontWeight:700,color:i<3?C.yellow:C.text}}>{medal[i]} {p.produto}</p>
                      <p style={{margin:0,fontSize:11,color:C.muted}}>{p.categoria} · {p.qtd} un. vendidas · {p.vendas} venda(s)</p>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <p style={{margin:0,fontSize:13,color:C.green,fontWeight:700}}>{fmt(p.receita)}</p>
                      <p style={{margin:0,fontSize:11,color:C.blue}}>Lucro: {fmt(p.lucro)} ({margPct}%)</p>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:10,color:C.muted,width:60}}>Receita</span>
                    <MiniBar value={p.receita} max={maxRec} color={C.green}/>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center",marginTop:3}}>
                    <span style={{fontSize:10,color:C.muted,width:60}}>Lucro</span>
                    <MiniBar value={p.lucro} max={maxRec} color={C.blue}/>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* ── MAIOR MARGEM ── */}
      {aba==="margem"&&(
        <Card>
          <h3 style={{margin:"0 0 14px",fontSize:14,color:C.green,fontWeight:700}}>📈 Produtos por Margem de Lucro (estoque)</h3>
          <p style={{margin:"0 0 14px",fontSize:12,color:C.muted}}>Quais produtos te dão mais lucro por real vendido?</p>
          {maisMargem.map((p,i)=>{
            const cor=Number(p.margem)>=50?C.green:Number(p.margem)>=30?C.blue:Number(p.margem)>=15?C.yellow:C.red;
            return(
              <div key={p.id} style={{padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
                  <div>
                    <p style={{margin:0,fontSize:13,fontWeight:700,color:C.text}}>{medal[i]||`${i+1}°`} {p.produto}</p>
                    <p style={{margin:0,fontSize:11,color:C.muted}}>{p.categoria} · Custo: {fmt(p.preco_custo)} · Venda: {fmt(p.preco_venda)} · Lucro unit.: {fmt(p.lucroUnit)}</p>
                  </div>
                  <span style={{fontSize:18,fontWeight:800,color:cor}}>{p.margem}%</span>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  <MiniBar value={Number(p.margem)} max={100} color={cor}/>
                  <span style={{fontSize:10,color:cor,fontWeight:700,width:40}}>{p.margem}%</span>
                </div>
              </div>
            );
          })}
        </Card>
      )}

      {/* ── CATEGORIAS ── */}
      {aba==="categorias"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <Card>
            <h3 style={{margin:"0 0 14px",fontSize:14,color:C.yellow,fontWeight:700}}>🗂 Desempenho por Categoria</h3>
            {analCategorias.length===0&&<p style={{color:C.dim,fontSize:13}}>Sem dados de vendas.</p>}
            {analCategorias.map((c,i)=>{
              const margPct=c.receita>0?Math.round((c.lucro/c.receita)*100):0;
              return(
                <div key={c.cat} style={{padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <div>
                      <p style={{margin:0,fontSize:13,fontWeight:700,color:i===0?C.yellow:C.text}}>{medal[i]} {c.cat}</p>
                      <p style={{margin:0,fontSize:11,color:C.muted}}>{c.qtd} unidades vendidas</p>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <p style={{margin:0,fontSize:13,color:C.yellow,fontWeight:700}}>{fmt(c.receita)}</p>
                      <p style={{margin:0,fontSize:11,color:C.green}}>Lucro: {fmt(c.lucro)} ({margPct}%)</p>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <MiniBar value={c.receita} max={maxCat} color={C.yellow}/>
                  </div>
                </div>
              );
            })}
          </Card>
          <Card>
            <h3 style={{margin:"0 0 12px",fontSize:14,color:C.purple,fontWeight:700}}>🔧 Manutenção por Categoria</h3>
            {Object.entries(manutencoes.reduce((m,mn)=>{m[mn.categoria]=(m[mn.categoria]||{qtd:0,rec:0});m[mn.categoria].qtd++;m[mn.categoria].rec+=mn.valor;return m;},{})). sort((a,b)=>b[1].rec-a[1].rec).map(([cat,{qtd,rec}],i)=>(
              <div key={cat} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`1px solid ${C.border}`}}>
                <span style={{fontSize:13,color:C.text}}>{medal[i]||`${i+1}°`} {cat} <span style={{color:C.muted,fontSize:11}}>({qtd} OS)</span></span>
                <span style={{fontSize:13,color:C.purple,fontWeight:700}}>{fmt(rec)}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* ── RANKING CLIENTES ── */}
      {aba==="clientes"&&(
        <Card>
          <h3 style={{margin:"0 0 14px",fontSize:14,color:C.purple,fontWeight:700}}>👑 Ranking Geral de Clientes</h3>
          {analClientes.filter(c=>c.totalVendas+c.totalMn>0).map((c,i)=>{
            const total=c.totalVendas+c.totalMn;
            const maxTotal=analClientes[0]?(analClientes[0].totalVendas+analClientes[0].totalMn):1;
            return(
              <div key={c.id} style={{padding:"11px 0",borderBottom:`1px solid ${C.border}`}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <p style={{margin:0,fontSize:14,fontWeight:800,color:i<3?C.yellow:C.text}}>{medal[i]||`${i+1}°`} {c.nome}</p>
                      {c.status==="inadimplente"&&<span style={{background:C.red+"22",color:C.red,border:`1px solid ${C.red}44`,padding:"1px 7px",borderRadius:10,fontSize:10,fontWeight:700}}>Inadimplente</span>}
                    </div>
                    <p style={{margin:"2px 0 0",fontSize:11,color:C.muted}}>
                      {c.qtdCompras>0&&`🛒 ${c.qtdCompras} produtos · `}
                      {c.qtdManutencoes>0&&`🔧 ${c.qtdManutencoes} OS · `}
                      {c.aReceber>0&&<span style={{color:C.blue}}>💰 {fmt(c.aReceber)} a receber</span>}
                    </p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{margin:0,fontSize:14,color:C.purple,fontWeight:800}}>{fmt(total)}</p>
                    {c.totalVendas>0&&<p style={{margin:0,fontSize:11,color:C.yellow}}>Compras: {fmt(c.totalVendas)}</p>}
                    {c.totalMn>0&&<p style={{margin:0,fontSize:11,color:C.purple}}>Manutenção: {fmt(c.totalMn)}</p>}
                  </div>
                </div>
                <MiniBar value={total} max={maxTotal} color={i===0?C.yellow:i===1?C.muted:C.border}/>
                {c.produtos.length>0&&(
                  <p style={{margin:"6px 0 0",fontSize:11,color:C.dim}}>
                    Produtos: {[...new Set(c.produtos)].join(", ")}
                  </p>
                )}
              </div>
            );
          })}
          {analClientes.filter(c=>c.totalVendas+c.totalMn===0).length>0&&(
            <p style={{margin:"12px 0 0",fontSize:12,color:C.dim}}>+ {analClientes.filter(c=>c.totalVendas+c.totalMn===0).length} cliente(s) sem movimentação ainda</p>
          )}
        </Card>
      )}

      {/* ── CONTRATOS INSIGHTS ── */}
      {aba==="contratos"&&(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:11}}>
            <Stat icon="💰" label="Total a receber"  value={fmt(montanteTotal(contratos))} color={C.blue}/>
            <Stat icon="📄" label="Contratos ativos" value={contratos.filter(c=>["ativo","vence_breve"].includes(statusContrato(c))).length} color={C.green}/>
            <Stat icon="⚠️" label="Vencidos"         value={contratos.filter(c=>statusContrato(c)==="vencido").length} color={C.red}/>
            <Stat icon="✅" label="Quitados"         value={contratos.filter(c=>statusContrato(c)==="quitado").length} color={C.green}/>
          </div>
          <Card>
            <h3 style={{margin:"0 0 14px",fontSize:14,color:C.blue,fontWeight:700}}>📊 Situação dos Contratos</h3>
            {contratos.map(c=>{
              const s=statusContrato(c),aRec=valorRestante(c),pct=Math.round((c.parcelasQuitadas/c.parcelas)*100);
              const cor=s==="quitado"?C.green:s==="vencido"?C.red:s==="vence_breve"?C.yellow:C.blue;
              return(
                <div key={c.id} style={{padding:"10px 0",borderBottom:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div>
                      <p style={{margin:0,fontSize:13,fontWeight:700,color:C.text}}>{c.clienteNome}</p>
                      <p style={{margin:0,fontSize:11,color:C.muted}}>{c.produto} · {c.parcelasQuitadas}/{c.parcelas} parcelas ({pct}%)</p>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      {aRec>0&&<span style={{fontSize:12,color:C.blue,fontWeight:700}}>{fmt(aRec)}</span>}
                      <Badge tipo={s}/>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <MiniBar value={pct} max={100} color={cor}/>
                    <span style={{fontSize:10,color:cor,width:32,textAlign:"right"}}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════
export default function App(){
  const [user, setUser] = useState(null);
  const [trialExpirado, setTrialExpirado] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? session.user : null);
    });
  }, []);

  const [tab,         setTab]         = useState("dashboard");
  const [clientes,    setClientes]    = useState(INIT_CLIENTES);
  const [contratos,   setContratos]   = useState(INIT_CONTRATOS);
  const [estoque,     setEstoque]     = useState(INIT_ESTOQUE);
  const [manutencoes, setManutencoes] = useState(INIT_MANUTENCOES);
  const [vendas,      setVendas]      = useState(INIT_VENDAS);
  const [menuOpen,    setMenuOpen]    = useState(false);

  const pages={
    dashboard:   <Dashboard   contratos={contratos} manutencoes={manutencoes} estoque={estoque} vendas={vendas}/>,
    clientes:    <Clientes    clientes={clientes} setClientes={setClientes} contratos={contratos} vendas={vendas} manutencoes={manutencoes}/>,
    contratos:   <Contratos   contratos={contratos} setContratos={setContratos} clientes={clientes}/>,
    estoque:     <Estoque     estoque={estoque} setEstoque={setEstoque} vendas={vendas} setVendas={setVendas} clientes={clientes} setClientes={setClientes}/>,
    vendas:      <Vendas      vendas={vendas} setVendas={setVendas} clientes={clientes} estoque={estoque} setEstoque={setEstoque}/>,
    manutencao:  <Manutencao  manutencoes={manutencoes} setManutencoes={setManutencoes} clientes={clientes}/>,
    cobranca:    <Cobranca    contratos={contratos}/>,
    financeiro:  <Financeiro  contratos={contratos} manutencoes={manutencoes} vendas={vendas}/>,
    inteligencia:<Inteligencia vendas={vendas} manutencoes={manutencoes} contratos={contratos} clientes={clientes} estoque={estoque}/>,
  };

  return(
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:"'DM Sans',system-ui,sans-serif",color:C.text}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-track{background:${C.panel};} ::-webkit-scrollbar-thumb{background:${C.border};border-radius:3px;}
        select option{background:${C.panel};}
      `}</style>

      {/* HEADER */}
      <div style={{background:C.panel,borderBottom:`1px solid ${C.border}`,padding:"12px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,background:"linear-gradient(135deg,#3b82f6,#a855f7)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:17}}>📱</div>
          <div>
            <p style={{margin:0,fontWeight:800,fontSize:15,color:C.text}}>Gambira<span style={{color:C.blue}}>.Com</span></p>
            <p style={{margin:0,fontSize:10,color:C.muted}}>Sistema de Gestão</p>
          </div>
        </div>
        <button onClick={()=>setMenuOpen(p=>!p)} style={{background:C.border,border:"none",borderRadius:7,padding:"7px 11px",color:C.text,cursor:"pointer",fontSize:17}}>☰</button>
      </div>

      {menuOpen&&(
        <div style={{background:C.panel,borderBottom:`1px solid ${C.border}`,padding:"8px 14px",display:"flex",flexDirection:"column",gap:3}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>{setTab(t.id);setMenuOpen(false);}}
              style={{background:tab===t.id?C.border:"transparent",border:"none",borderRadius:7,padding:"9px 13px",color:tab===t.id?C.blue:C.muted,fontSize:13,fontWeight:tab===t.id?700:500,cursor:"pointer",textAlign:"left",fontFamily:"inherit",display:"flex",alignItems:"center",gap:9}}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      )}

      <div style={{display:"flex"}}>
        {/* SIDEBAR */}
        <div style={{width:185,minHeight:"calc(100vh - 57px)",background:C.panel,borderRight:`1px solid ${C.border}`,padding:"12px 8px",display:"flex",flexDirection:"column",gap:2,position:"sticky",top:57,alignSelf:"flex-start"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{background:tab===t.id?C.card:"transparent",border:tab===t.id?`1px solid ${C.border}`:"1px solid transparent",borderRadius:9,padding:"8px 11px",color:tab===t.id?C.blue:C.muted,fontSize:12,fontWeight:tab===t.id?700:500,cursor:"pointer",textAlign:"left",fontFamily:"inherit",display:"flex",alignItems:"center",gap:9,transition:"all .12s"}}>
              <span style={{fontSize:15}}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>

        <div style={{flex:1,padding:"20px 18px",maxWidth:940,overflowY:"auto"}}>
{!user ? <Login onLogin={setUser} /> : pages[tab]}        </div>
      </div>
    </div>
  );
}