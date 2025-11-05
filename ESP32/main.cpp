#include <Arduino.h>
#include <WiFi.h>
// #include <HTTPClient.h> // Se estivéssemos enviando dados via HTTP
#include <ArduinoJson.h> // Biblioteca essencial para processar o JSON de Configuração

// --- DEFINIÇÕES DE HARDWARE (Constantes) ---
// Usar 'const' e 'constexpr' economiza RAM.
constexpr int SENSOR_PIN_BASE = 32; // Exemplo para o primeiro sensor ADC
constexpr int RELE_PIN_A = 25;      // GPIO do Relé Fileira A
constexpr int RELE_PIN_B = 26;      // GPIO do Relé Fileira B
constexpr int RELE_PIN_C = 27;      // GPIO do Relé Fileira C
constexpr int RELE_PIN_D = 14;      // GPIO do Relé Fileira D

// Vetor de Pinos para iteração rápida
constexpr int RELE_PINS[] = {RELE_PIN_A, RELE_PIN_B, RELE_PIN_C, RELE_PIN_D};
constexpr int NUM_FILEIRAS = 4;
constexpr int NUM_SENSORES_B = 7; // Usando o exemplo da Fileira B detalhada

// --- CONFIGURAÇÕES DO SISTEMA (Estruturas e Variáveis Globais) ---
// Evitar String (com S maiúsculo) para economizar RAM e prevenir fragmentação.
// Usar 'struct' para organizar as configurações lidas do JSON.

struct FileiraConfig {
    float umidadeLigar;   // Ponto de Murcha Permanente (PMP)
    float umidadeDesligar; // Capacidade de Campo (CC)
    int relePin;
};

// Configurações globais atuais (preenchidas via JSON)
FileiraConfig configs[NUM_FILEIRAS];

// Dados dos sensores (apenas os valores de umidade)
// Usamos arrays fixos para evitar alocação dinâmica (new/malloc)
float umidadeFileiraA[3];
float umidadeFileiraB[NUM_SENSORES_B];
// ... (outros arrays de umidade)

// --- Variáveis de Otimização de Tempo (Tickers) ---
// Usar millis() e variáveis 'unsigned long' para gerenciar tarefas não-bloqueantes.
unsigned long ultimoCicloLeitura = 0;
unsigned long ultimoCicloLogica = 0;
const unsigned long INTERVALO_LEITURA = 600000; // 10 minutos (em milissegundos)
const unsigned long INTERVALO_LOGICA = 5000;    // 5 segundos para reavaliar a lógica

// --- FUNÇÕES DE UTILIDADE E OTIMIZAÇÃO ---

/**
 * @brief Converte o valor ADC (0-4095) para Umidade (0-100%).
 * Usamos a função map não-linear, se necessário, ou uma simples interpolação.
 * @param adcValue Valor lido do ADC.
 * @return float Umidade em porcentagem (0.0 a 100.0).
 */
float adcToUmidade(int adcValue) {
    // Exemplo de interpolação linear simples:
    // 0 = 100% de umidade; 4095 = 0% de umidade (o ideal é calibrar)
    return map(adcValue, 4095, 0, 0, 1000) / 10.0f; 
}

/**
 * @brief Encontra o Pior Cenário (menor umidade) em uma fileira.
 * @param umidades Array de umidades.
 * @param size Tamanho do array.
 * @return float A menor umidade encontrada.
 */
float encontrarPiorCenario(const float umidades[], size_t size) {
    if (size == 0) return 100.0f; // Valor seguro se não houver sensores
    float pior = umidades[0];
    for (size_t i = 1; i < size; i++) {
        if (umidades[i] < pior) {
            pior = umidades[i];
        }
    }
    return pior;
}

/**
 * @brief Simula o parse de JSON para ler a configuração (de SPIFFS/Web Server/MQTT)
 * USAR CString/char[] para o payload JSON.
 */
void carregarConfiguracoes() {
    // Simulação do JSON lido (de um char array ou String, mas preferencialmente char array)
    // Otimização: Usar StaticJsonDocument para alocação estática e rápida.
    StaticJsonDocument<512> doc; 
    
    // O JSON REAL lido
    // const char* jsonPayload = "{...}"; 
    // deserializeJson(doc, jsonPayload);

    // MOCK para preencher a estrutura:
    // Fileira A
    configs[0].umidadeLigar = 15.0f;
    configs[0].umidadeDesligar = 40.0f;
    configs[0].relePin = RELE_PIN_A;

    // Fileira B
    configs[1].umidadeLigar = 15.0f;
    configs[1].umidadeDesligar = 30.0f;
    configs[1].relePin = RELE_PIN_B;

    // ... (e assim por diante para C e D)
}

// --- LOGICA CRITICA (Função loop otimizada) ---

void loop() {
    unsigned long now = millis();

    // 1. LEITURA DOS SENSORES (Tarefa Lenta)
    if (now - ultimoCicloLeitura >= INTERVALO_LEITURA) {
        // Implementar a leitura dos 15+ sensores:
        // Ex: umidadeFileiraA[0] = adcToUmidade(analogRead(SENSOR_PIN_BASE));
        // Otimização: Mapear os pinos ADC corretamente e iterar.
        
        // Simulação de Leitura para Fileira B (Pior Cenário: 9.9% - Emergência)
        umidadeFileiraB[0] = 19.1f;
        umidadeFileiraB[1] = 17.0f;
        umidadeFileiraB[2] = 14.8f; 
        umidadeFileiraB[3] = 22.5f;
        umidadeFileiraB[4] = 9.9f; // EMERGÊNCIA
        umidadeFileiraB[5] = 28.0f;
        umidadeFileiraB[6] = 35.0f;

        ultimoCicloLeitura = now;

        // Otimização: Se houver envio de telemetria, fazer AQUI.
        // Isso isola a tarefa de rede da lógica de controle.
    }

    // 2. LOGICA DE CONTROLE DO RELÉ (Tarefa Rápida e Crítica)
    if (now - ultimoCicloLogica >= INTERVALO_LOGICA) {
        // Itera sobre as 4 fileiras para a tomada de decisão
        // **NÃO DEVE CONTER BLOCOS DE CÓDIGO GRANDES (ex: delay())**
        
        for (int i = 0; i < NUM_FILEIRAS; i++) {
            float piorCenario;
            // Otimização: Usar switch/case para rotear a array correta sem alocação
            switch (i) {
                case 0: piorCenario = encontrarPiorCenario(umidadeFileiraA, 3); break;
                case 1: piorCenario = encontrarPiorCenario(umidadeFileiraB, NUM_SENSORES_B); break;
                // ... (outros cases para C e D)
                default: piorCenario = 100.0f; // Valor seguro
            }

            const FileiraConfig& cfg = configs[i]; // 'const&' evita cópia
            
            // Lógica de Ativação do Relé (Prioridade: 1. Emergência, 2. PMP)
            if (piorCenario < 10.0f /* Exemplo: Umidade Emergência */ ) {
                // EMERGÊNCIA: LIGA IMEDIATAMENTE (e deve logar)
                digitalWrite(cfg.relePin, HIGH); 
            } else if (piorCenario < cfg.umidadeLigar) {
                // PMP ATINGIDO: Ativa o AGENDAMENTO Noturno
                // Implementação: Verifica se a hora atual está dentro do intervalo noturno.
                
                // MOCK DE VERIFICAÇÃO DE HORÁRIO:
                // if (isNightTime()) {
                //    digitalWrite(cfg.relePin, HIGH); 
                // } else {
                //    digitalWrite(cfg.relePin, LOW); // Mantenha desligado durante o dia
                // }
                // MOCK SIMPLIFICADO: se PMP atingido, liga
                digitalWrite(cfg.relePin, HIGH); 

            } else if (piorCenario >= cfg.umidadeDesligar) {
                // CC ATINGIDO: DESLIGA
                digitalWrite(cfg.relePin, LOW);
            }
        }
        
        ultimoCicloLogica = now;
    }
    
    // NENHUM 'delay()' DEVE SER USADO AQUI!
}

void setup() {
    Serial.begin(115200);
    // 1. Inicializa o Hardware
    for (int pin : RELE_PINS) {
        pinMode(pin, OUTPUT);
        digitalWrite(pin, LOW); // Garante que todos os relés iniciam DESLIGADOS
    }
    // Otimização: Configura WiFi de forma assíncrona para não bloquear
    // WiFi.mode(WIFI_STA); 
    // WiFi.begin(ssid, password);
    
    // 2. Carrega Configurações (JSON)
    carregarConfiguracoes();
}

// ... (Outras funções, como isNightTime(), etc.)