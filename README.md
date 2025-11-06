![Alt text](https://raw.githubusercontent.com/Rilen/IrrigaSeca/refs/heads/main/img/IrrigaSeca.png "IrrigaSeca")

# **💧 IrrigaSeca 1.15: Sistema Inteligente de Irrigação de Precisão**

## **🎯 Sobre o Projeto**

O **IrrigaSeca** é um sistema de Agricultura de Precisão projetado para automatizar a irrigação de hortaliças em pequenas e médias propriedades rurais (Agricultura Familiar). O principal objetivo é maximizar a eficiência hídrica e energética, garantindo que as culturas recebam água apenas quando necessário, com base em parâmetros agronômicos específicos para cada tipo de solo e cultura.

O sistema opera sob uma lógica de **Turno de Rega Dinâmico** (Baseado em Sensor), que se provou ser a forma mais econômica e eficaz de gestão hídrica.

## **✨ Funcionalidades Principais**

| Recurso | Descrição | Status de Implementação |
| :---- | :---- | :---- |
| **Lógica Agronômica** | Decisão de ligar/desligar baseada no Ponto de Murcha Permanente (PMP) e Capacidade de Campo (CC) de cada fileira. | **Completo (Firmware C++)** |
| **Monitoramento por Pior Cenário** | O relé liga se o **sensor mais seco** (pior cenário) da fileira atingir o PMP, protegendo toda a linha. | **Completo (App.js)** |
| **Irrigação Noturna/Emergência** | Irrigação preferencialmente agendada para a madrugada (menor evaporação), com **Override de Emergência** para secas críticas. | **Completo (Firmware C++/Conf.)** |
| **Dashboard em Tempo Real** | Visualização de dados históricos e atuais (gráfico de umidade, estado ON/OFF do relé). | **Completo (index.html, app.js)** |
| **Mapa de Calor Geolocalizado** | Identifica áreas de maior estresse hídrico na plantação. | **Completo (Leaflet)** |
| **Painel de Configurações** | Interface Web responsiva para ajuste de limites PMP, CC e horários de irrigação (simulação de envio POST). | **Completo (configuracoes.html)** |

## **📐 Estrutura da Horta e Configurações Agronômicas**

O projeto utiliza 4 fileiras principais com espaçamento de **1,50 metros**, ideal para o trânsito de tratores de agricultura familiar.

| Fileira | Cultura Principal (Exemplo) | Tipo de Solo Simulado | Ligar (PMP) | Desligar (CC) |
| :---- | :---- | :---- | :---- | :---- |
| **A** | Folhas (Alface, Couve) | Argiloso (Alta Retenção) | 15% | 40% |
| **B** | Verduras (Tomate, Pimentão) | Arenoso (Baixa Retenção) | 15% | 30% |
| **C** | Grãos/Tubérculos (Milho, Aipim) | Textura Média | 16% | 32% |
| **D** | Fileira Adicional | Arenoso Fino | 17% | 28% |

## **🛠️ Guia de Pastas e Desenvolvimento**

Este repositório é dividido em duas partes principais: o Frontend (Dashboard) e a lógica de comunicação de dados.

### **1\. Frontend (Interface Web)**

Acesse a dashboard diretamente via GitHub Pages: https://rilen.github.io/IrrigaSeca/

| Arquivo | Função | Observações |
| :---- | :---- | :---- |
| index.html | Dashboard principal | Ponto de entrada da visualização. |
| app.js | **Lógica Central** | Lógica de risco, processamento de logs (fetch), inicialização de gráficos e mapas. |
| style.css | Estilos visuais | Design responsivo para dashboard e painel de controle. |
| configuracoes.html | Painel de Controle | Envia configurações POST (simulado) para o ESP32. |

### **2\. Dados e Configurações (Backend Mock)**

Estes arquivos simulam o que o ESP32 precisa servir/consumir.

| Pasta/Arquivo | Função | Status |
| :---- | :---- | :---- |
| data/\*.log | Logs de telemetria (Umidade, Estado do Relé) | Usados por app.js via fetch. |
| status.atual.json | Mock do Status de Leitura de Múltiplos Sensores | Usado para renderizar o Mapa de Calor e a Tabela de Telemetria. |
| config.fileiras.json | Estrutura de Limites Agronômicos | Define PMP, CC, Emergência e Horários. |

### **3\. Firmware (C++)**

O código C++ otimizado reside no arquivo IrrigaSeca\_Firmware.cpp (ou similar) e deve ser desenvolvido usando o ambiente **Arduino/ESP-IDF**. O firmware é responsável por receber as configurações do configuracoes.html e executar a lógica crítica de controle de relés.

## **🤝 Contribuição**

Sinta-se à vontade para enviar sugestões (Issues) ou melhorias (Pull Requests)\! Especialmente na calibração do sensor (adcToUmidade) e na implementação real do servidor web no ESP32.

*Em colaboração com IAs Gemini/Google Grok, CoPilot e PhD André T. P. .*

---

**Desenvolvido por Rilen - [Visite meu Portfólio Completo](https://rilen.github.io/portfolio/)**
