import { useState } from "react";
import { supabase } from "./supabase";

export default function Login({ onLogin }) {
  const [modo, setModo] = useState("login"); // login ou cadastro
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCadastro() {
    setLoading(true);
    setErro("");
    const { data, error } = await supabase.auth.signUp({ email, password: senha });
    if (error) { setErro(error.message); setLoading(false); return; }
    const user = data.user;
    await supabase.from("usuarios").insert({ id: user.id, email, nome, plano: "trial", trial_inicio: new Date().toISOString() });
    onLogin(user);
    setLoading(false);
  }

  async function handleLogin() {
    setLoading(true);
    setErro("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error) { setErro("Email ou senha incorretos"); setLoading(false); return; }
    onLogin(data.user);
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0f1117", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ background:"#1a1d2e", padding:"40px", borderRadius:"16px", width:"100%", maxWidth:"400px", boxShadow:"0 8px 32px rgba(0,0,0,0.4)" }}>
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <h1 style={{ color:"#fff", fontSize:"28px", margin:0 }}>🔧 Gambira<span style={{color:"#6366f1"}}>.Com</span></h1>
          <p style={{ color:"#888", marginTop:"8px" }}>Sistema de Gestão</p>
        </div>

        <div style={{ display:"flex", marginBottom:"24px", background:"#0f1117", borderRadius:"8px", padding:"4px" }}>
          {["login","cadastro"].map(m => (
            <button key={m} onClick={() => setModo(m)} style={{ flex:1, padding:"8px", border:"none", borderRadius:"6px", cursor:"pointer", background: modo===m ? "#6366f1" : "transparent", color: modo===m ? "#fff" : "#888", fontWeight:"600" }}>
              {m === "login" ? "Entrar" : "Cadastrar"}
            </button>
          ))}
        </div>

        {modo === "cadastro" && (
          <input placeholder="Seu nome" value={nome} onChange={e => setNome(e.target.value)}
            style={{ width:"100%", padding:"12px", marginBottom:"12px", background:"#0f1117", border:"1px solid #333", borderRadius:"8px", color:"#fff", boxSizing:"border-box" }} />
        )}
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          style={{ width:"100%", padding:"12px", marginBottom:"12px", background:"#0f1117", border:"1px solid #333", borderRadius:"8px", color:"#fff", boxSizing:"border-box" }} />
        <input placeholder="Senha" type="password" value={senha} onChange={e => setSenha(e.target.value)}
          style={{ width:"100%", padding:"12px", marginBottom:"16px", background:"#0f1117", border:"1px solid #333", borderRadius:"8px", color:"#fff", boxSizing:"border-box" }} />

        {erro && <p style={{ color:"#ef4444", marginBottom:"12px", fontSize:"14px" }}>{erro}</p>}

        <button onClick={modo === "login" ? handleLogin : handleCadastro} disabled={loading}
          style={{ width:"100%", padding:"14px", background:"#6366f1", color:"#fff", border:"none", borderRadius:"8px", fontSize:"16px", fontWeight:"700", cursor:"pointer" }}>
          {loading ? "Aguarde..." : modo === "login" ? "Entrar" : "Criar conta grátis (7 dias)"}
        </button>

        {modo === "cadastro" && <p style={{ color:"#888", fontSize:"12px", textAlign:"center", marginTop:"12px" }}>✅ 7 dias grátis, sem cartão</p>}
      </div>
    </div>
  );
}