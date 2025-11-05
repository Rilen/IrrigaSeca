const files=["fileiraA","fileiraB","fileiraC","fileiraD"];
const cores=['#00f','#f00','#0f0','#fa0'];
const MAX=500; 
let chart=null;
let th=0; // Throttle timer
const cache={};

// Variáveis globais para dados de análise
let currentStatus = null; 
let releConfig = null; // Agora carrega de config_fileiras.json

// Geolocation Constants (Atualizado com sua sugestão)
const LAT_CENTER = -22.098954; 
const LON_CENTER = -41.783619; 
const a=document.getElementById('a'),m=document.getElementById('m'),p=document.getElementById('p');
const ctx=document.getElementById('graf').getContext('2d');


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
  if (y === anoAtual) { o.selected = true; }
  a.appendChild(o);
}
meses.forEach(mes => {
    let o = document.createElement('option');
    o.value = mes;
    o.text = mes;
    if (mes === mesAtual) { o.selected = true; }
    m.appendChild(o);
});


// Funções de Carregamento
function url(f){return `./data/${f}_${m.value}_${a.value}.log`;} // Espera o arquivo em /data/
async function load(f){
  const u=url(f); 
  if(cache[u])return cache[u];
  try{
    // --- LÓGICA DE BUSCA REAL DO ARQUIVO LOG NA WEB ---
    const r=await fetch(u);
    if(!r.ok) return {l:[], d:[]}; 
	
    const t=await r.text();
    // --- FIM DA LÓGICA DE BUSCA REAL ---
    
    // Processamento do log:
    const linhas=t.trim().split('\n');
    const l=[],d=[];
    // Garante que a linha começa com o formato de data/hora (202x)
    linhas.forEach(x=>{const v=x.split(';');if(v[0].startsWith('202')){l.push(v[0]);d.push(+v[1]);}});
    
    return cache[u]={l,d};
  }catch(e){
      console.error("Erro ao carregar log:", u, e);
      return {l:[],d:[]};
  }
}

async function loadJSON(filepath) {
    if (cache[filepath]) return cache[filepath];
    try {
        const r = await fetch(filepath);
        if (!r.ok) return null; // Retorna null se não encontrar (ou 404)
        const data = await r.json();
        return cache[filepath] = data;
    } catch(e) {
        console.error("Erro ao carregar JSON:", filepath, e);
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

    // ATUALIZAÇÃO: As chamadas loadJSON agora buscarão os arquivos reais no servidor.
    // Você precisa garantir que 'status.atual.json' e 'config_fileiras.json' estejam acessíveis.
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
    tbl();map();alertas();th=0;
  },10);
};

// Funções de Análise Preditiva - MANTIDAS
const tbl=()=>{
  const t=document.getElementById('tbl');
  let html = '';

  if (!releConfig || !currentStatus) {
    // Melhorar feedback: se não carregar, mostrar que o status não está disponível
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
  const threshold = releConfig ? releConfig.default_ativacao : 20; // Usa default activation como base do risco
  const h = []; // Dados do Heatmap: [lat, lon, intensidade]

  if (mapa) mapa.remove();
  // Usa as constantes globais LAT_CENTER e LON_CENTER
  mapa = L.map('map').setView([LAT_CENTER, LON_CENTER], 15); 
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapa);
  
  // 1. Coletar dados de currentStatus para o heatmap
  if (currentStatus) {
      files.forEach(fileira => {
          const data = currentStatus[fileira];
          if (data) {
              data.forEach(sensor => {
                  const umidade = sensor.umid;
                  
                  // Intensidade (inverso do risco): quanto menor a umidade, maior o peso (vermelho)
                  let intensity = 1 - Math.min(1, Math.max(0, (umidade - threshold) / 10)); // Dividido por 10 para suavizar o gradiente
                  if (umidade < threshold) intensity = 1; // Tudo abaixo do limite é 1.0 (vermelho)
                  
                  h.push([sensor.lat, sensor.lon, intensity]);
              });
          }
      });
  }

  // 2. Adicionar Heatmap
  L.heatLayer(h, {
      radius: 20,
      blur: 15,
      gradient: {0.0: 'green', 0.5: 'yellow', 1.0: 'red'} 
  }).addTo(mapa);
  
  // 3. Adicionar a Legenda
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
  
  // Verifica se a configuração foi carregada antes de prosseguir
  if (!releConfig || !currentStatus) {
    div.textContent='⚠️ Dados de Status/Configuração ausentes.';
    div.style.background='#f0ad4e';
    return;
  }

  files.forEach(fileira=>{
    const data = currentStatus[fileira];
    const config = releConfig.fileiras[fileira];
    
    if (data && config && config.reles && config.reles.length > 0) {
        // Encontra a menor umidade de ativação (o limite mais baixo para o qual o sistema deve ligar)
        const minThreshold = Math.min(...config.reles.map(r => r.ligar_em));
        
        // Calcula a média da umidade da fileira (simplificação, idealmente, veria o pior sensor)
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

// Event handlers simplificados para os selects (ano, mês, período)
[a,m,p].forEach(el=>el.onclick=upd);
upd();