const files=["fileiraA","fileiraB","fileiraC","fileiraD"];
const cores=['#00f','#f00','#0f0','#fa0'];
const MAX=500; 
let chart=null;
let th=0; // Throttle timer
const cache={};

// Variáveis globais para dados de análise
let currentStatus = null; 
let releConfig = null;

// Geolocation Constants
const LAT_CENTER = -22.098954; 
const LON_CENTER = -41.783619; 
const a=document.getElementById('a'),m=document.getElementById('m'),p=document.getElementById('p');
const ctx=document.getElementById('graf').getContext('2d');

// Dados de log de NOVEMBRO/2025 fornecidos pelo usuário, injetados para visualização imediata no ambiente de simulação.
// NOVO BLOCO DE DADOS INJETADOS PARA GARANTIR A VISUALIZAÇÃO
const INJECTED_LOG_DATA = {
    // Conteúdo de fileiraA_novembro_2025.log
    "fileiraA_novembro_2025.log": `2025-11-01 07:00:00;21.6;RELE_OFF
2025-11-01 08:00:00;22.1;RELE_OFF
2025-11-01 09:00:00;18.4;RELE_ON
2025-11-01 10:00:00;26.9;RELE_OFF
2025-11-01 11:00:00;23.1;RELE_OFF
2025-11-01 12:00:00;16.0;RELE_ON
2025-11-01 13:00:00;19.5;RELE_ON
2025-11-01 14:00:00;24.3;RELE_OFF
2025-11-01 15:00:00;21.3;RELE_OFF
2025-11-01 16:00:00;18.4;RELE_ON
2025-11-01 17:00:00;18.5;RELE_ON
2025-11-01 18:00:00;25.1;RELE_OFF
2025-11-01 19:00:00;20.8;RELE_OFF
2025-11-01 20:00:00;25.5;RELE_OFF
2025-11-01 21:00:00;15.7;RELE_ON
2025-11-01 22:00:00;21.1;RELE_OFF
2025-11-01 23:00:00;26.7;RELE_OFF
2025-11-02 00:00:00;30.0;RELE_OFF
2025-11-02 01:00:00;20.5;RELE_OFF
2025-11-02 02:00:00;20.1;RELE_OFF
2025-11-02 03:00:00;24.5;RELE_OFF
2025-11-02 04:00:00;16.8;RELE_ON
2025-11-02 05:00:00;22.6;RELE_OFF
2025-11-02 06:00:00;21.6;RELE_OFF
2025-11-02 07:00:00;22.7;RELE_OFF
2025-11-02 08:00:00;18.9;RELE_ON
2025-11-02 09:00:00;19.6;RELE_ON
2025-11-02 10:00:00;24.2;RELE_OFF
2025-11-02 11:00:00;15.1;RELE_ON
2025-11-02 12:00:00;24.6;RELE_OFF
2025-11-02 13:00:00;24.1;RELE_OFF
2025-11-02 14:00:00;22.0;RELE_OFF
2025-11-02 15:00:00;19.0;RELE_ON
2025-11-02 16:00:00;16.8;RELE_ON
2025-11-02 17:00:00;17.0;RELE_ON
2025-11-02 18:00:00;18.8;RELE_ON
2025-11-02 19:00:00;28.3;RELE_OFF
2025-11-02 20:00:00;15.4;RELE_ON
2025-11-02 21:00:00;25.1;RELE_OFF
2025-11-02 22:00:00;22.4;RELE_OFF
2025-11-02 23:00:00;25.8;RELE_OFF
2025-11-03 00:00:00;16.6;RELE_ON
2025-11-03 01:00:00;23.6;RELE_OFF
2025-11-03 02:00:00;22.5;RELE_OFF
2025-11-03 03:00:00;19.6;RELE_ON
2025-11-03 04:00:00;25.6;RELE_OFF
2025-11-03 05:00:00;24.1;RELE_OFF
2025-11-03 06:00:00;19.7;RELE_ON
2025-11-03 07:00:00;21.1;RELE_OFF
2025-11-03 08:00:00;25.1;RELE_OFF
2025-11-03 09:00:00;17.8;RELE_ON
2025-11-03 10:00:00;23.1;RELE_OFF
2025-11-03 11:00:00;26.0;RELE_OFF
2025-11-03 12:00:00;25.0;RELE_OFF
2025-11-03 13:00:00;22.2;RELE_OFF
2025-11-03 14:00:00;20.6;RELE_OFF
2025-11-03 15:00:00;14.6;RELE_ON
2025-11-03 16:00:00;27.0;RELE_OFF
2025-11-03 17:00:00;15.7;RELE_ON
2025-11-03 18:00:00;22.8;RELE_OFF
2025-11-03 19:00:00;17.3;RELE_ON
2025-11-03 20:00:00;20.5;RELE_ON
2025-11-03 21:00:00;22.2;RELE_OFF
2025-11-03 22:00:00;22.4;RELE_OFF
2025-11-03 23:00:00;23.3;RELE_OFF
`,
    // Conteúdo de fileiraB_novembro_2025.log
    "fileiraB_novembro_2025.log": `2025-11-01 07:00:00;24.4;RELE_OFF
2025-11-01 08:00:00;27.1;RELE_OFF
2025-11-01 09:00:00;29.3;RELE_OFF
2025-11-01 10:00:00;26.3;RELE_OFF
2025-11-01 11:00:00;26.7;RELE_OFF
2025-11-01 12:00:00;26.8;RELE_OFF
2025-11-01 13:00:00;21.5;RELE_OFF
2025-11-01 14:00:00;19.9;RELE_ON
2025-11-01 15:00:00;23.7;RELE_OFF
2025-11-01 16:00:00;24.2;RELE_OFF
2025-11-01 17:00:00;27.8;RELE_OFF
2025-11-01 18:00:00;26.2;RELE_OFF
2025-11-01 19:00:00;27.9;RELE_OFF
2025-11-01 20:00:00;24.0;RELE_OFF
2025-11-01 21:00:00;19.6;RELE_ON
2025-11-01 22:00:00;30.0;RELE_OFF
2025-11-01 23:00:00;27.1;RELE_OFF
2025-11-02 00:00:00;20.9;RELE_OFF
2025-11-02 01:00:00;22.7;RELE_OFF
2025-11-02 02:00:00;21.8;RELE_OFF
2025-11-02 03:00:00;20.4;RELE_OFF
2025-11-02 04:00:00;20.1;RELE_OFF
2025-11-02 05:00:00;26.5;RELE_OFF
2025-11-02 06:00:00;27.6;RELE_OFF
2025-11-02 07:00:00;23.2;RELE_OFF
2025-11-02 08:00:00;26.8;RELE_OFF
2025-11-02 09:00:00;17.7;RELE_ON
2025-11-02 10:00:00;26.7;RELE_OFF
2025-11-02 11:00:00;27.7;RELE_OFF
2025-11-02 12:00:00;23.1;RELE_OFF
2025-11-02 13:00:00;23.7;RELE_OFF
2025-11-02 14:00:00;23.2;RELE_OFF
2025-11-02 15:00:00;20.7;RELE_OFF
2025-11-02 16:00:00;22.8;RELE_OFF
2025-11-02 17:00:00;19.8;RELE_ON
2025-11-02 18:00:00;26.3;RELE_OFF
2025-11-02 19:00:00;24.3;RELE_OFF
2025-11-02 20:00:00;17.3;RELE_ON
2025-11-02 21:00:00;18.5;RELE_ON
2025-11-02 22:00:00;22.4;RELE_OFF
2025-11-02 23:00:00;23.8;RELE_OFF
2025-11-03 00:00:00;24.6;RELE_OFF
2025-11-03 01:00:00;24.7;RELE_OFF
2025-11-03 02:00:00;18.3;RELE_ON
2025-11-03 03:00:00;22.0;RELE_OFF
2025-11-03 04:00:00;29.6;RELE_OFF
2025-11-03 05:00:00;19.9;RELE_ON
2025-11-03 06:00:00;24.4;RELE_OFF
2025-11-03 07:00:00;16.4;RELE_ON
2025-11-03 08:00:00;24.6;RELE_OFF
2025-11-03 09:00:00;27.4;RELE_OFF
2025-11-03 10:00:00;21.9;RELE_OFF
2025-11-03 11:00:00;22.2;RELE_OFF
2025-11-03 12:00:00;18.5;RELE_ON
2025-11-03 13:00:00;17.7;RELE_ON
2025-11-03 14:00:00;24.5;RELE_OFF
2025-11-03 15:00:00;24.6;RELE_OFF
2025-11-03 16:00:00;23.1;RELE_OFF
2025-11-03 17:00:00;20.4;RELE_OFF
2025-11-03 18:00:00;19.2;RELE_ON
2025-11-03 19:00:00;25.8;RELE_OFF
2025-11-03 20:00:00;28.0;RELE_OFF
2025-11-03 21:00:00;27.9;RELE_OFF
2025-11-03 22:00:00;26.0;RELE_OFF
2025-11-03 23:00:00;30.6;RELE_OFF
`,
    // Conteúdo de fileiraC_novembro_2025.log
    "fileiraC_novembro_2025.log": `2025-11-01 07:00:00;22.5;RELE_OFF
2025-11-01 08:00:00;21.1;RELE_OFF
2025-11-01 09:00:00;21.0;RELE_OFF
2025-11-01 10:00:00;20.5;RELE_OFF
2025-11-01 11:00:00;15.9;RELE_ON
2025-11-01 12:00:00;22.3;RELE_OFF
2025-11-01 13:00:00;21.2;RELE_OFF
2025-11-01 14:00:00;16.4;RELE_ON
2025-11-01 15:00:00;14.4;RELE_ON
2025-11-01 16:00:00;17.1;RELE_ON
2025-11-01 17:00:00;21.6;RELE_OFF
2025-11-01 18:00:00;14.0;RELE_ON
2025-11-01 19:00:00;23.8;RELE_OFF
2025-11-01 20:00:00;21.3;RELE_OFF
2025-11-01 21:00:00;23.5;RELE_OFF
2025-11-01 22:00:00;19.2;RELE_ON
2025-11-01 23:00:00;18.0;RELE_ON
2025-11-02 00:00:00;16.8;RELE_ON
2025-11-02 01:00:00;21.0;RELE_OFF
2025-11-02 02:00:00;19.2;RELE_ON
2025-11-02 03:00:00;20.0;RELE_ON
2025-11-02 04:00:00;17.3;RELE_ON
2025-11-02 05:00:00;18.6;RELE_ON
2025-11-02 06:00:00;17.2;RELE_ON
2025-11-02 07:00:00;14.8;RELE_ON
2025-11-02 08:00:00;22.0;RELE_OFF
2025-11-02 09:00:00;12.8;RELE_ON
2025-11-02 10:00:00;17.7;RELE_ON
2025-11-02 11:00:00;19.1;RELE_ON
2025-11-02 12:00:00;21.5;RELE_OFF
2025-11-02 13:00:00;21.9;RELE_OFF
2025-11-02 14:00:00;22.8;RELE_OFF
2025-11-02 15:00:00;15.2;RELE_ON
2025-11-02 16:00:00;22.4;RELE_OFF
2025-11-02 17:00:00;23.2;RELE_OFF
2025-11-02 18:00:00;16.5;RELE_ON
2025-11-02 19:00:00;20.0;RELE_ON
2025-11-02 20:00:00;21.2;RELE_OFF
2025-11-02 21:00:00;16.9;RELE_ON
2025-11-02 22:00:00;23.7;RELE_OFF
2025-11-02 23:00:00;18.9;RELE_ON
2025-11-03 00:00:00;16.2;RELE_ON
2025-11-03 01:00:00;18.7;RELE_ON
2025-11-03 02:00:00;19.2;RELE_ON
2025-11-03 03:00:00;18.6;RELE_ON
2025-11-03 04:00:00;23.7;RELE_OFF
2025-11-03 05:00:00;23.7;RELE_OFF
2025-11-03 06:00:00;20.5;RELE_OFF
2025-11-03 07:00:00;22.2;RELE_OFF
2025-11-03 08:00:00;20.8;RELE_OFF
2025-11-03 09:00:00;18.5;RELE_ON
2025-11-03 10:00:00;21.9;RELE_OFF
2025-11-03 11:00:00;20.0;RELE_ON
2025-11-03 12:00:00;17.3;RELE_ON
2025-11-03 13:00:00;21.9;RELE_OFF
2025-11-03 14:00:00;15.4;RELE_ON
2025-11-03 15:00:00;23.4;RELE_OFF
2025-11-03 16:00:00;19.3;RELE_ON
2025-11-03 17:00:00;17.4;RELE_ON
2025-11-03 18:00:00;17.4;RELE_ON
2025-11-03 19:00:00;20.2;RELE_ON
2025-11-03 20:00:00;18.8;RELE_ON
2025-11-03 21:00:00;22.3;RELE_OFF
2025-11-03 22:00:00;19.3;RELE_ON
2025-11-03 23:00:00;19.3;RELE_ON
`,
    // Conteúdo de fileiraD_novembro_2025.log
    "fileiraD_novembro_2025.log": `2025-11-01 07:00:00;17.2;RELE_ON
2025-11-01 08:00:00;22.4;RELE_OFF
2025-11-01 09:00:00;18.6;RELE_ON
2025-11-01 10:00:00;17.8;RELE_ON
2025-11-01 11:00:00;18.0;RELE_ON
2025-11-01 12:00:00;26.8;RELE_OFF
2025-11-01 13:00:00;23.9;RELE_OFF
2025-11-01 14:00:00;22.1;RELE_OFF
2025-11-01 15:00:00;18.7;RELE_ON
2025-11-01 16:00:00;18.8;RELE_ON
2025-11-01 17:00:00;14.8;RELE_ON
2025-11-01 18:00:00;13.8;RELE_ON
2025-11-01 19:00:00;19.0;RELE_ON
2025-11-01 20:00:00;22.9;RELE_OFF
2025-11-01 21:00:00;23.1;RELE_OFF
2025-11-01 22:00:00;18.8;RELE_ON
2025-11-01 23:00:00;19.9;RELE_ON
2025-11-02 00:00:00;23.5;RELE_OFF
2025-11-02 01:00:00;21.9;RELE_OFF
2025-11-02 02:00:00;28.5;RELE_OFF
2025-11-02 03:00:00;24.1;RELE_OFF
2025-11-02 04:00:00;18.0;RELE_ON
2025-11-02 05:00:00;20.3;RELE_ON
2025-11-02 06:00:00;19.3;RELE_ON
2025-11-02 07:00:00;21.2;RELE_OFF
2025-11-02 08:00:00;27.0;RELE_OFF
2025-11-02 09:00:00;23.8;RELE_OFF
2025-11-02 10:00:00;24.0;RELE_OFF
2025-11-02 11:00:00;20.2;RELE_OFF
2025-11-02 12:00:00;20.5;RELE_OFF
2025-11-02 13:00:00;20.6;RELE_OFF
2025-11-02 14:00:00;21.7;RELE_OFF
2025-11-02 15:00:00;13.5;RELE_ON
2025-11-02 16:00:00;20.1;RELE_ON
2025-11-02 17:00:00;24.8;RELE_OFF
2025-11-02 18:00:00;20.8;RELE_OFF
2025-11-02 19:00:00;24.0;RELE_OFF
2025-11-02 20:00:00;23.9;RELE_OFF
2025-11-02 21:00:00;24.3;RELE_OFF
2025-11-02 22:00:00;19.6;RELE_ON
2025-11-02 23:00:00;18.0;RELE_ON
2025-11-03 00:00:00;21.4;RELE_OFF
2025-11-03 01:00:00;21.2;RELE_OFF
2025-11-03 02:00:00;25.8;RELE_OFF
2025-11-03 03:00:00;23.4;RELE_OFF
2025-11-03 04:00:00;12.6;RELE_ON
2025-11-03 05:00:00;22.3;RELE_OFF
2025-11-03 06:00:00;20.0;RELE_ON
2025-11-03 07:00:00;17.4;RELE_ON
2025-11-03 08:00:00;19.9;RELE_ON
2025-11-03 09:00:00;21.9;RELE_OFF
2025-11-03 10:00:00;18.1;RELE_ON
2025-11-03 11:00:00;29.4;RELE_OFF
2025-11-03 12:00:00;23.2;RELE_OFF
2025-11-03 13:00:00;22.7;RELE_OFF
2025-11-03 14:00:00;20.2;RELE_OFF
2025-11-03 15:00:00;21.2;RELE_OFF
2025-11-03 16:00:00;17.0;RELE_ON
2025-11-03 17:00:00;19.7;RELE_ON
2025-11-03 18:00:00;14.9;RELE_ON
2025-11-03 19:00:00;20.1;RELE_ON
2025-11-03 20:00:00;26.5;RELE_OFF
2025-11-03 21:00:00;24.8;RELE_OFF
2025-11-03 22:00:00;27.3;RELE_OFF
2025-11-03 23:00:00;20.1;RELE_OFF
`
};
// FIM DO BLOCO DE DADOS INJETADOS

// Variáveis de data e inicialização do menu de data/ano
const meses = ['janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const hoje = new Date();
const anoAtual = hoje.getFullYear();
const mesAtual = meses[hoje.getMonth()];
const minAno = 2022; 
const maxAno = 2027; 

for(let y = minAno; y <= maxAno; y++){
  let o = document.createElement('option');
  o.value = y;
  o.text = y;
  // Define 2025 como padrão para mostrar dados injetados
  if (y === 2025) { o.selected = true; } else { o.selected = false; } 
  a.appendChild(o);
}
meses.forEach(mes => {
    let o = document.createElement('option');
    o.value = mes;
    o.text = mes;
    // Define novembro como padrão para mostrar dados injetados
    if (mes === 'novembro') { o.selected = true; } else { o.selected = false; }
    m.appendChild(o);
});


// Funções de Carregamento
function url(f){return `./data/${f}_${m.value}_${a.value}.log`;}
async function load(f){
  const filename = `${f}_${m.value}_${a.value}.log`;
  const u=url(f); 
  if(cache[u])return cache[u];
  
  let t = INJECTED_LOG_DATA[filename]; // Tenta pegar os dados injetados primeiro

  if (!t) {
    // Se não houver dados injetados, tenta buscar na web (comportamento real)
    try {
        const r=await fetch(u);
        if(!r.ok) return {l:[], d:[]}; 
        t = await r.text();
    } catch(e) {
        console.error("Erro ao carregar log dinamicamente:", u, e);
        return {l:[],d:[]};
    }
  }

  try{
    const linhas=t.trim().split('\n');
    const l=[],d=[];
    // Garante que a linha começa com o formato de data/hora (202x)
    linhas.forEach(x=>{const v=x.split(';');if(v[0].startsWith('202')){l.push(v[0]);d.push(+v[1]);}});
    
    return cache[u]={l,d};
  }catch(e){
      console.error("Erro ao processar log:", u, e);
      return {l:[],d:[]};
  }
}

async function loadJSON(filepath) {
    if (cache[filepath]) return cache[filepath];
    try {
        // Para os arquivos JSON de configuração e status, fazemos mock para garantir que funcionem,
        // mas em um servidor web real, o fetch abaixo seria o ideal.
        
        if (filepath === './config_fileiras.json') {
             return {
              "default_ativacao": 18,
              "default_desativacao": 25,
              "fileiras": {
                "fileiraA": { "reles": [{"id": "sensor_principal", "ligar_em": 15, "desligar_em": 60}] },
                "fileiraB": { "reles": [{"id": "sensor_principal", "ligar_em": 18, "desligar_em": 27}] },
                "fileiraC": { "reles": [{"id": "sensor_principal", "ligar_em": 15, "desligar_em": 30}] },
                "fileiraD": { "reles": [{"id": "sensor_principal", "ligar_em": 17, "desligar_em": 28}] }
              }
            };
        } 
        else if (filepath === './status.atual.json') {
            return {
                // Dados simulados de status atual (baseados nos seus logs de Novembro)
                "fileiraA": [{"id": "s1", "umid": 18.0, "lat": LAT_CENTER + 0.001, "lon": LON_CENTER - 0.001}, {"id": "s2", "umid": 25.1, "lat": LAT_CENTER + 0.001, "lon": LON_CENTER + 0.001}],
                "fileiraB": [{"id": "s3", "umid": 17.7, "lat": LAT_CENTER, "lon": LON_CENTER - 0.001}, {"id": "s4", "umid": 26.5, "lat": LAT_CENTER, "lon": LON_CENTER + 0.001}],
                "fileiraC": [{"id": "s5", "umid": 14.4, "lat": LAT_CENTER - 0.001, "lon": LON_CENTER - 0.001}, {"id": "s6", "umid": 19.8, "lat": LAT_CENTER - 0.001, "lon": LON_CENTER + 0.001}],
                "fileiraD": [{"id": "s7", "umid": 15.6, "lat": LAT_CENTER - 0.002, "lon": LON_CENTER}]
            };
        }

        // Se não for um mock, tenta buscar o arquivo JSON real
        const r = await fetch(filepath);
        if (!r.ok) return null;
        const data = await r.json();
        return cache[filepath] = data;

    } catch(e) {
        return null;
    }
}


function range(len,per){
  if(per==='24h')return [Math.max(0,len-24),len];
  if(per==='7d')return [Math.max(0,len-168),len];
  if(per==='15d')return [Math.max(0,len-360),len];
  if(per==='30d')return [Math.max(0,len-720),len];
  if(per==='60d')return [Math.max(0,len-1440),len];
  if(per==='90d')return [Math.max(0,len-2160),len];
  return [0,len];
}

const upd=()=>{
  if(th)return; th=1;
  setTimeout(async()=>{
    const sel = files; 

    currentStatus = await loadJSON('./status.atual.json'); 
    releConfig = await loadJSON('./config_fileiras.json');
    
    let L=[],DS=[],mx=0,per=p.value;
    for(let f of sel){
      const {l,d}=await load(f);
      if(!l.length)continue;
      const [i,e]=range(l.length,per);
      let ls=l.slice(i,e), ds=d.slice(i,e);
      if(ds.length>MAX)ds=ds.filter((_,k)=>k%Math.ceil(ds.length/MAX)===0);
      if(ls.length>mx){mx=ls.length;L=ls;}
      DS.push({label:f,data:ds,borderColor:cores[files.indexOf(f)],tension:.1,pointRadius:2,fill:false});
    }
    const dias = per==='15d'?15 : per==='30d'?30 : per==='60d'?60 : per==='90d'?90 : per==='7d'?7 : per==='24h'?1 : 999;
    const step = mx>0 ? Math.ceil(mx/(12*dias)) : 1;
    if(chart)chart.destroy();
    chart=new Chart(ctx,{type:'line',data:{labels:L,datasets:DS},options:{
      responsive:true,maintainAspectRatio:true,animation:false,
      plugins:{legend:{
        display:true, 
      }},
      scales:{x:{ticks:{maxTicksLimit:12,stepSize:step}}, y:{min:0,max:100,title:{display:true,text:'Umidade (%)'}}}
    }});
    tbl();
    map();
    loadForecast(); 
    alertas();
    th=0;
  },10);
};

// Funções de Análise Preditiva - MANTIDAS
const tbl=()=>{
  const t=document.getElementById('tbl');
  let html = '';

  if (!releConfig || !currentStatus) {
    t.innerHTML = '<tr><td colspan="2">Status indisponível.<br/><small>Verifique o arquivo config_fileiras.json e status.atual.json no servidor.</small></td></tr>';
    return;
  }

  const rows = files.map(fileira => {
    const data = currentStatus[fileira];
    const config = releConfig.fileiras[fileira];

    if (!data || data.length === 0 || !config || !config.reles || config.reles.length === 0) return null;

    // Calcular a média de umidade da fileira (para simplificar o display)
    const sum = data.reduce((acc, sensor) => acc + sensor.umid, 0);
    const avg = sum / data.length;
    const fileiraChar = fileira.slice(-1).toUpperCase();
    
    // Usa o limite de LIGAR do primeiro relé/sensor como base de risco
    const threshold = config.reles[0].ligar_em;

    let classCss = 'baixo';
    let statusText = 'BAIXO';

    // Lógica de Risco
    if (avg < threshold) { 
      classCss = 'alto';
      statusText = 'ALTO';
    } else if (avg < threshold + 8) { // Média entre LIGAR e LIGAR+8%
      classCss = 'medio';
      statusText = 'MÉDIO';
    } else {
        classCss = 'baixo';
        statusText = 'BAIXO';
    }

    return `<tr><td>Fileira ${fileiraChar}</td><td class="${classCss}">${statusText} (${avg.toFixed(1)}%)</td></tr>`;
  }).filter(r => r !== null);
  
  html = rows.join('');
  t.innerHTML = html;
};

let mapa=null;
const map=()=>{
  const threshold = releConfig ? releConfig.default_ativacao : 20;
  const h = []; 

  if (mapa) mapa.remove();
  mapa = L.map('map').setView([LAT_CENTER, LON_CENTER], 15); 
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapa);
  
  if (currentStatus) {
      files.forEach(fileira => {
          const data = currentStatus[fileira];
          if (data) {
              data.forEach(sensor => {
                  const umidade = sensor.umid;
                  let intensity = 1 - Math.min(1, Math.max(0, (umidade - threshold) / 10));
                  if (umidade < threshold) intensity = 1; 
                  
                  h.push([sensor.lat, sensor.lon, intensity]);
              });
          }
      });
  }

  L.heatLayer(h, {
      radius: 20,
      blur: 15,
      gradient: {0.0: 'green', 0.5: 'yellow', 1.0: 'red'} 
  }).addTo(mapa);
  
  const legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
      const div = L.DomUtil.create('div', 'l-control l-control-custom');
      const thresholdLimit = releConfig ? releConfig.default_ativacao : 20;
      const grades = [0, thresholdLimit, thresholdLimit + 8]; 
      const labels = ['Umidade Crítica', 'Umidade Média', 'Umidade Alta'];
      const colors = ['red', 'yellow', 'green']; 

      div.innerHTML += '<h4>Risco de Seca</h4>';
      
      for (let i = 0; i < labels.length; i++) {
          const color = colors[i];
          const label = labels[i];
          
          let rangeText;
          if (i === 0) { 
              rangeText = `Umidade < ${grades[1].toFixed(1)}% (IRRIGAR)`;
          } else if (i === 1) { 
              rangeText = `${grades[1].toFixed(1)}% a ${grades[2].toFixed(1)}%`;
          } else { 
              rangeText = `Umidade > ${grades[2].toFixed(1)}%`;
          }

          div.innerHTML +=
              `<div style="margin-bottom: 5px;">` +
              `<i style="background: ${color};"></i> ` +
              `<span>${label}<br/><small>${rangeText}</small></span>` +
              `</div>`;
      }
      return div;
  };
  legend.addTo(mapa);
};


const alertas=()=>{
  const div=document.createElement('div');
  div.style=`position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
             background:#222;color:#fff;padding:15px 25px;border-radius:50px;
             box-shadow:0 4px 20px #0008;z-index:999;font-weight:bold;
             animation:fade 4s forwards;`;
  document.body.appendChild(div);
  setTimeout(()=>div.remove(),4000);

  const secos=[];
  
  if (!releConfig || !currentStatus) {
    div.textContent='⚠️ Dados de Status/Configuração ausentes.';
    div.style.background='#f0ad4e';
    return;
  }

  files.forEach(fileira=>{
    const data = currentStatus[fileira];
    const config = releConfig.fileiras[fileira];
    
    if (data && config && config.reles && config.reles.length > 0) {
        const minThreshold = Math.min(...config.reles.map(r => r.ligar_em));
        const avg = data.reduce((acc, sensor) => acc + sensor.umid, 0) / data.length;

        if(avg < minThreshold){
            secos.push({f: fileira, umid: avg});
        }
    }
  });

  if(secos.length){
    const fileirasSecas = secos.map(x=>x.f.slice(-1)).join(', ');
    const umidadeCritica = secos[0].umid.toFixed(1);
    div.textContent=`⚠️ IRRIGUE JÁ: Fileiras ${fileirasSecas} (${umidadeCritica}%)`;
    div.style.background='#d9534f';
  }else{
    div.textContent='✅ Umidade OK em todas fileiras';
    div.style.background='#5cb85c';
  }
};

// --- NOVA LÓGICA DE PREVISÃO DO TEMPO ---
const mockForecast = [
    { day: "Hoje", temp_min: 19, temp_max: 27, rain_prob: 30 },
    { day: "Qui", temp_min: 18, temp_max: 26, rain_prob: 70 },
    { day: "Sex", temp_min: 17, temp_max: 25, rain_prob: 85 },
    { day: "Sáb", temp_min: 20, temp_max: 29, rain_prob: 10 },
    { day: "Dom", temp_min: 21, temp_max: 30, rain_prob: 5 },
    { day: "Seg", temp_min: 19, temp_max: 27, rain_prob: 60 },
    { day: "Ter", temp_min: 16, temp_max: 24, rain_prob: 90 }
];

const loadForecast = () => {
    const forecastDiv = document.getElementById('forecast-data');
    if (!forecastDiv) return;

    let html = '';
    
    if (mockForecast.length === 0) {
        forecastDiv.innerHTML = '<p>Nenhuma previsão disponível.</p>';
        return;
    }

    mockForecast.forEach(day => {
        const rainColor = day.rain_prob > 50 ? '#007bff' : '#5cb85c';
        const tempColor = day.temp_max > 28 ? '#d9534f' : '#333';
        
        html += `
            <div class="forecast-day">
                <span class="day">${day.day}</span>
                <span class="temp" style="color: ${tempColor};">${day.temp_min}°/${day.temp_max}°C</span>
                <span class="rain" style="color: ${rainColor};">${day.rain_prob}%</span>
            </div>
        `;
    });
    
    forecastDiv.innerHTML = html;
};

// Event handlers simplificados para os selects (ano, mês, período)
[a,m,p].forEach(el=>el.onclick=upd);
upd();