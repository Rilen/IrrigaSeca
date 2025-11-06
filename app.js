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
  // Define 2025 como padrão para começar a visualização
  if (y === 2025) { o.selected = true; } else { o.selected = false; }
  a.appendChild(o);
}
meses.forEach(mes => {
    let o = document.createElement('option');
    o.value = mes;
    o.text = mes;
    // Define novembro como padrão para começar a visualização
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
    if(!r.ok) return {l:[], d:[], r_state:[]}; 
	
    const t=await r.text();
    
    // Novo: Extrair também o estado do relé (3ª coluna)
    const linhas=t.trim().split('\n');
    const l=[],d=[], r_state=[]; // Nova lista para estado do relé
    linhas.forEach(x=>{
      const v=x.split(';');
      if(v[0].startsWith('202')){
          l.push(v[0]);
          d.push(+v[1]);
          // Armazena o estado do relé como string (RELE_ON ou RELE_OFF)
          r_state.push(v[2].trim()); 
      }
    });
    
    // Retorna os dados, incluindo o estado do relé
    return cache[u]={l,d, r_state};
  }catch(e){
      console.error("Erro ao carregar log dinamicamente:", u, e);
      return {l:[],d:[], r_state:[]}; // Retorna r_state vazio em caso de erro
  }
}

async function loadJSON(filepath) {
    if (cache[filepath]) return cache[filepath];
    try {
        // Mock de configuração e status para fins de desenvolvimento
        if (filepath === './config_fileiras.json') {
             return {
              "hora_inicio_noturna": 1, 
              "hora_fim_noturna": 5,    
              "umidade_emergencia": 10,
              "fileiras": {
                "fileiraA": { "reles": [{"id": "sensor_principal", "ligar_em": 15, "desligar_em": 40}] }, // Argiloso (CC: 40)
                "fileiraB": { "reles": [{"id": "sensor_principal", "ligar_em": 15, "desligar_em": 30}] }, // Arenoso (CC: 30)
                "fileiraC": { "reles": [{"id": "sensor_principal", "ligar_em": 16, "desligar_em": 32}] }, 
                "fileiraD": { "reles": [{"id": "sensor_principal", "ligar_em": 17, "desligar_em": 28}] }
              }
            };
        } 
        else if (filepath === './status.atual.json') {
            // Mock de status, simulando 7 sensores e cenários de Emergência/Pior Cenário
             return {
                "fileiraA": [{"id": "A1", "umid": 14.5, "lat": LAT_CENTER + 0.001, "lon": -41.783500}, {"id": "A2", "umid": 18.2, "lat": LAT_CENTER + 0.001, "lon": -41.783600}, {"id": "A3", "umid": 25.0, "lat": LAT_CENTER + 0.001, "lon": -41.783700}],
                "fileiraB": [
                    {"id": "B1", "umid": 19.1, "lat": LAT_CENTER + 0.0005, "lon": -41.783500},
                    {"id": "B2", "umid": 17.0, "lat": LAT_CENTER + 0.0005, "lon": -41.783600},
                    {"id": "B3", "umid": 14.8, "lat": LAT_CENTER + 0.0005, "lon": -41.783700}, // Pior Cenário: Abaixo de PMP (15)
                    {"id": "B4", "umid": 22.5, "lat": LAT_CENTER + 0.0005, "lon": -41.783800},
                    {"id": "B5", "umid": 9.9, "lat": LAT_CENTER + 0.0005, "lon": -41.783900},  // Emergência: Abaixo de 10
                    {"id": "B6", "umid": 28.0, "lat": LAT_CENTER + 0.0005, "lon": -41.784000},
                    {"id": "B7", "umid": 35.0, "lat": LAT_CENTER + 0.0005, "lon": -41.784100}
                ],
                "fileiraC": [{"id": "C1", "umid": 15.0, "lat": LAT_CENTER - 0.001, "lon": -41.783500}, {"id": "C2", "umid": 19.8, "lat": LAT_CENTER - 0.001, "lon": -41.783600}],
                "fileiraD": [{"id": "D1", "umid": 20.0, "lat": LAT_CENTER - 0.002, "lon": LON_CENTER}]
            };
        }
        
        // Se não for um mock, tenta buscar o arquivo JSON real
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
    const all_rele_states = {}; // Objeto para armazenar estados ON/OFF para anotações

    for(let f of sel){
      const {l,d, r_state}=await load(f); // Desestrutura r_state
      if(!l.length)continue;
      
      const [i,e]=range(l.length,per);
      let ls=l.slice(i,e), ds=d.slice(i,e);
      let rs=r_state.slice(i,e); // Extrai estados do relé para o período

      if(ds.length>MAX) {
          // Simplifica a amostragem de dados e estados do relé
          const step_size = Math.ceil(ds.length/MAX);
          ds=ds.filter((_,k)=>k%step_size===0);
          ls=ls.filter((_,k)=>k%step_size===0);
          rs=rs.filter((_,k)=>k%step_size===0);
      }
      
      if(ls.length>mx){mx=ls.length;L=ls;}
      DS.push({label:f,data:ds,borderColor:cores[files.indexOf(f)],tension:.1,pointRadius:2,fill:false});

      // Salva os estados para a criação das anotações (faixas)
      all_rele_states[f] = { labels: ls, states: rs }; 
    }
    
    // --- Lógica de Criação de Anotações (Faixas ON/OFF) ---
    const annotations = [];
    Object.keys(all_rele_states).forEach(fileira => {
        const { labels, states } = all_rele_states[fileira];
        const color_index = files.indexOf(fileira);
        const fileira_cor = cores[color_index];
        
        let start_index = -1;
        
        labels.forEach((time_label, index) => {
            const is_on = states[index] === 'RELE_ON';

            if (is_on && start_index === -1) {
                // Início de um novo período ON
                start_index = index;
            } else if (!is_on && start_index !== -1) {
                // Fim de um período ON
                // Cria a anotação para o período de start_index até o atual index
                annotations.push({
                    type: 'box',
                    xMin: labels[start_index],
                    xMax: time_label, 
                    backgroundColor: fileira_cor + '33', 
                    borderColor: fileira_cor,
                    borderWidth: 1,
                    borderDash: [5, 5],
                    label: {
                        content: `IRRIGAÇÃO ${fileira.slice(-1).toUpperCase()} ON`,
                        enabled: (index - start_index) > 10, 
                        position: 'start',
                        font: { size: 10 }
                    }
                });
                start_index = -1; // Reseta para procurar o próximo ON
            }
            // Se for a última leitura e o relé estiver ON, fecha o período.
            if (index === labels.length - 1 && is_on && start_index !== -1) {
                annotations.push({
                    type: 'box',
                    xMin: labels[start_index],
                    xMax: time_label,
                    backgroundColor: fileira_cor + '33',
                    borderColor: fileira_cor,
                    borderWidth: 1,
                    borderDash: [5, 5],
                    label: {
                        content: `IRRIGAÇÃO ${fileira.slice(-1).toUpperCase()} ON`,
                        enabled: (index - start_index) > 10,
                        position: 'start',
                        font: { size: 10 }
                    }
                });
            }
        });
    });
    // --- Fim da Lógica de Anotações ---
    
    const dias = per==='15d'?15 : per==='30d'?30 : per==='60d'?60 : per==='90d'?90 : per==='7d'?7 : per==='24h'?1 : 999;
    const step = mx>0 ? Math.ceil(mx/(12*dias)) : 1;
    if(chart)chart.destroy();
    chart=new Chart(ctx,{
        type:'line',
        data:{labels:L,datasets:DS},
        options:{
            responsive:true,maintainAspectRatio:true,animation:false,
            plugins:{
                legend:{display:true},
                annotation: {
                    annotations: annotations 
                }
            },
            scales:{x:{ticks:{maxTicksLimit:12,stepSize:step}}, y:{min:0,max:100,title:{display:true,text:'Umidade (%)'}}}
        }
    });
    
    tbl();
    map();
    loadForecast(); 
    alertas();
    
    // Obtém a fileira selecionada ou usa B como padrão
    const selectedFileira = document.getElementById('telemetry-fileira-select').value || 'fileiraB';
    loadTelemetryTable(selectedFileira); // Chamada dinâmica
    
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
    const thresholdEmergencia = releConfig.umidade_emergencia;

    // 3. Lógica de Risco baseada no Pior Cenário
    let classCss = 'baixo';
    let statusText = 'BAIXO';

    if (umidPiorCenario < thresholdEmergencia) {
        classCss = 'alto';
        statusText = 'EMERGÊNCIA';
    } else if (umidPiorCenario < thresholdLigar) { 
        classCss = 'alto';
        statusText = 'ALTO'; // Ativar Irrigação (PMP atingido)
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

let mapa=null;
const map=()=>{
  // Nota: O mapa usa um mock simples aqui, o ideal seria usar a umidade crítica do pior sensor.
  const threshold = releConfig ? 15 : 20; // Usando o PMP 15 como limite visual crítico
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
      // Usando o PMP do mock (15) para definir o limite
      const thresholdLimit = releConfig ? 15 : 20; 
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
    
    // Verifica se a umidade mais crítica é de emergência
    const isEmergency = secos.some(s => s.umid < releConfig.umidade_emergencia);

    let alertText;
    if (isEmergency) {
        alertText = `🚨 EMERGÊNCIA: Irrigar Fileiras ${fileirasSecas} (${umidadeCritica}%) AGORA!`;
        div.style.background='#d9534f';
    } else {
        alertText = `⚠️ IRRIGUE JÁ: Fileiras ${fileirasSecas} (${umidadeCritica}%) (Agendado para Noite)`;
        div.style.background='#f0ad4e';
    }
    div.textContent = alertText;

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


// --- FUNÇÃO: DETALHES DA TELEMETRIA ---
const loadTelemetryTable = (fileira) => {
    const table = document.getElementById('tbl-telemetria');
    let html = '';

    if (!releConfig || !currentStatus || !currentStatus[fileira]) {
        // Altera o conteúdo do <tbody> diretamente, caso exista
        const tbody = table.querySelector('tbody') || table; 
        tbody.innerHTML = `<tr><td colspan="4">Dados de telemetria ${fileira.slice(-1).toUpperCase()} indisponíveis.</td></tr>`;
        return;
    }

    const dataSensores = currentStatus[fileira];
    const config = releConfig.fileiras[fileira].reles[0];
    const globalConfig = releConfig;
    
    const umidade_minima = Math.min(...dataSensores.map(s => s.umid));
    
    let decisao_rele = '';
    let class_css = '';
    
    // Decisão simulada do Relé (ESP32 Logic)
    
    if (umidade_minima < globalConfig.umidade_emergencia) {
        decisao_rele = 'LIGAR AGORA (Emergência)';
        class_css = 'status-on';
    } else if (umidade_minima < config.ligar_em) {
        decisao_rele = `AGENDADO (${globalConfig.hora_inicio_noturna}:00h)`;
        class_css = 'status-scheduled';
    } else if (umidade_minima >= config.desligar_em) {
        decisao_rele = 'DESLIGADO (CC Atingido)';
        class_css = 'status-off';
    } else {
        decisao_rele = 'DESLIGADO (OK)';
        class_css = 'status-off';
    }

    // Preenche a tabela com os detalhes de CADA sensor
    dataSensores.forEach((sensor, index) => {
        const isCritical = sensor.umid < config.ligar_em;
        const isEmergency = sensor.umid < globalConfig.umidade_emergencia;
        const sensorClass = isEmergency ? 'alto' : isCritical ? 'medio' : 'baixo';
        // Ajuste para garantir que a coluna de umidade crítica só apareça na primeira linha
        const criticalCell = (index === 0) ? `<td style="font-weight: bold;">${umidade_minima.toFixed(1)}%</td>` : `<td style="font-weight: normal;">-</td>`;


        html += `
            <tr>
                <td>${sensor.id}</td>
                <td class="${sensorClass}">${sensor.umid.toFixed(1)}%</td>
                <td style="text-align: center;">${isEmergency ? 'EMERGÊNCIA' : isCritical ? 'PMP CRÍTICO' : 'OK'}</td>
                ${criticalCell}
            </tr>
        `;
    });
    
    // Adiciona a linha de SUMÁRIO/DECISÃO ao final
    html += `
        <tr>
            <td colspan="2" style="text-align: right; font-weight: bold; background: #fafafa;">DECISÃO DO RELÉ (${fileira.slice(-1).toUpperCase()})</td>
            <td class="${class_css}">${decisao_rele}</td>
            <td style="font-weight: bold;"></td>
        </tr>
    `;

    // Insere o novo conteúdo na tabela
    // Note: Mantendo <thead> e <tbody> para semântica. 
    table.querySelector('tbody').innerHTML = html;
};

// Event handlers simplificados para os selects (ano, mês, período)
[a,m,p].forEach(el=>el.onclick=upd);
upd();