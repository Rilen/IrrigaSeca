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
  // Define 2025 como padrão
  if (y === 2025) { o.selected = true; } else { o.selected = false; }
  a.appendChild(o);
}
meses.forEach(mes => {
    let o = document.createElement('option');
    o.value = mes;
    o.text = mes;
    // Define novembro como padrão
    if (mes === 'novembro') { o.selected = true; } else { o.selected = false; }
    m.appendChild(o);
});


// Funções de Carregamento
function url(f){return `./data/${f}_${m.value}_${a.value}.log`;}
async function load(f){
  const u=url(f); 
  if(cache[u])return cache[u];
  try{
    // CÓDIGO LIMPO: Fazer o fetch diretamente do servidor
    const r=await fetch(u);
    if(!r.ok) return {l:[], d:[]}; 
	
    const t=await r.text();
    
    // Processamento do log:
    const linhas=t.trim().split('\n');
    const l=[],d=[];
    // Garante que a linha começa com o formato de data/hora (202x)
    linhas.forEach(x=>{const v=x.split(';');if(v[0].startsWith('202')){l.push(v[0]);d.push(+v[1]);}});
    
    return cache[u]={l,d};
  }catch(e){
      console.error("Erro ao carregar log dinamicamente:", u, e);
      return {l:[],d:[]};
  }
}

async function loadJSON(filepath) {
    if (cache[filepath]) return cache[filepath];
    try {
        // MOCKS para fins de lógica e visualização em desenvolvimento
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
                "fileiraA": [
                    {"id": "A1", "umid": 14.5, "lat": -22.098900, "lon": -41.783500}, 
                    {"id": "A2", "umid": 18.2, "lat": -22.098900, "lon": -41.783600},
                    {"id": "A3", "umid": 25.0, "lat": -22.098900, "lon": -41.783700}
                ],
                "fileiraB": [
                    {"id": "B1", "umid": 19.1, "lat": -22.098954, "lon": -41.783500},
                    {"id": "B2", "umid": 17.0, "lat": -22.098954, "lon": -41.783600}, 
                    {"id": "B3", "umid": 26.5, "lat": -22.098954, "lon": -41.783700} 
                ],
                "fileiraC": [
                    {"id": "C1", "umid": 15.0, "lat": -22.099000, "lon": -41.783500}, 
                    {"id": "C2", "umid": 19.8, "lat": -22.099000, "lon": -41.783600}
                ],
                "fileiraD": [
                    {"id": "D1", "umid": 20.0, "lat": -22.099050, "lon": -41.783500}
                ]
            };
        }
        // Fim dos Mocks. No servidor real, o fetch abaixo será executado:
        const r = await fetch(filepath);
        if (!r.ok) return null;
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

// Funções de Análise Preditiva - LÓGICA DE PIOR CENÁRIO
const tbl=()=>{
  const t=document.getElementById('tbl');
  let html = '';

  if (!releConfig || !currentStatus) {
    t.innerHTML = '<tr><td colspan="2">Status indisponível.</td></tr>';
    return;
  }

  const rows = files.map(fileira => {
    const data = currentStatus[fileira];
    const config = releConfig.fileiras[fileira];

    if (!data || data.length === 0 || !config || !config.reles || config.reles.length === 0) return null;

    // 1. Encontra a umidade MAIS BAIXA (pior cenário) entre todos os sensores da fileira.
    const umidPiorCenario = Math.min(...data.map(sensor => sensor.umid)); 
    
    // 2. Usa o limite de LIGAR do primeiro relé/sensor como a referência agronômica.
    const thresholdLigar = config.reles[0].ligar_em;

    // 3. Lógica de Risco baseada no Pior Cenário
    let classCss = 'baixo';
    let statusText = 'BAIXO';

    if (umidPiorCenario < thresholdLigar) { 
      classCss = 'alto';
      statusText = 'ALTO'; // Ativar Irrigação!
    } else if (umidPiorCenario < thresholdLigar + 8) { 
      classCss = 'medio';
      statusText = 'MÉDIO';
    } else {
        classCss = 'baixo';
        statusText = 'BAIXO';
    }
    
    // Mostra a umidade do pior cenário na tabela
    const fileiraChar = fileira.slice(-1).toUpperCase();
    return `<tr><td>Fileira ${fileiraChar}</td><td class="${classCss}">${statusText} (${umidPiorCenario.toFixed(1)}%)</td></tr>`;
  }).filter(r => r !== null);
  
  html = rows.join('');
  t.innerHTML = html;
};

// Lógica de Mapa de Calor (Usa o pior cenário para a cor)
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
                  
                  // Adiciona TODOS os sensores, não só a média
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


// Lógica de Alertas (pop-up) - LÓGICA DE PIOR CENÁRIO
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
        // Encontra a menor umidade (pior cenário)
        const umidPiorCenario = Math.min(...data.map(sensor => sensor.umid));
        const minThreshold = config.reles[0].ligar_em; // Limite de ativação
        
        if(umidPiorCenario < minThreshold){
            secos.push({f: fileira, umid: umidPiorCenario});
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

// Lógica da Previsão do Tempo (Mock)
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