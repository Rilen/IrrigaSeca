#include <Arduino.h>
#include <WiFi.h>
// #include <ESPAsyncWebServer.h> // Para um servidor web real, seria ideal
#include <ArduinoJson.h> // Essencial para processar o JSON de configuração

// --- 1. DEFINIÇÕES DE HARDARE E CONSTANTES (Uso de Flash/Memória) ---
// Usar 'constexpr' garante que estes valores NÃO ocupem RAM.
constexpr int SENSOR_PIN_BASE = 32;     // Pinos ADC (Analógico/Digital)
constexpr uint8_t NUM_SENSORES_POR_FILEIRA = 7;
constexpr uint8_t NUM_FILEIRAS = 4;

// Pinos dos Relés (usar uint8_t, 8-bit integer, para menor ocupação de memória)
constexpr uint8_t RELE_PINS[NUM_FILEIRAS] = {25, 26, 27, 14}; // A, B, C, D

// --- 2. ESTRUTURAS DE DADOS (Otimização de RAM) ---
struct FileiraConfig {
    // float ocupa menos espaço que double no ESP32 padrão (32 bits)
    float umidadeLigar;   // PMP (Ponto de Murcha)
    float umidadeDesligar; // CC (Capacidade de Campo)
    uint8_t relePin;
};

struct GlobalConfig {
    float umidadeEmergencia;
    uint8_t horaInicioNoturna;
    uint8_t horaFimNoturna;
    // Usar 'FileiraConfig configs[]' para armazenar todas as 4 configs
    FileiraConfig configs[NUM_FILEIRAS];
};

// Configurações e estado do sistema (devem ser globais, mas bem controladas)
GlobalConfig globalConfig; 
bool releState[NUM_FILEIRAS]; // Estado LIGADO/DESLIGADO de cada relé
bool irrigacaoAgendada[NUM_FILEIRAS]; // Flag de agendamento noturno

// --- 3. FUNÇÕES CRÍTICAS (Medição e Controle) ---

/**
 * @brief Converte o valor ADC para Umidade (0-100%).
 */
float adcToUmidade(int adcValue) {
    // Implementação da calibração (ADC -> %)
    // Retorna a umidade simulada (Mock)
    return (float)random(100, 350) / 10.0f; 
}

/**
 * @brief Encontra o Pior Cenário (menor umidade) em uma fileira.
 * @return A menor umidade da fileira.
 */
float encontrarPiorCenario(uint8_t fileiraIdx) {
    float piorUmidade = 100.0f;
    
    // Otimização: A leitura ADC é lenta, mas precisa ser feita aqui.
    // Usar o pino base + offset se os sensores forem multiplexados.
    // Para mock, faremos uma simulação simples:
    for (uint8_t i = 0; i < NUM_SENSORES_POR_FILEIRA; i++) {
        // Mock de leitura (em produção, seria analogRead)
        float umidadeAtual = adcToUmidade(10); 
        
        // Simula dados do pior cenário para Fileira B (índice 1)
        if (fileiraIdx == 1) { 
             // Simula um sensor em 9.9%
             if (i == 4) umidadeAtual = 9.9f; 
             // Simula um sensor em 14.8%
             if (i == 2) umidadeAtual = 14.8f; 
        }

        if (umidadeAtual < piorUmidade) {
            piorUmidade = umidadeAtual;
        }
    }
    return piorUmidade;
}

/**
 * @brief Lógica central de controle de um relé (chamado a cada ciclo rápido).
 */
void controleRele(uint8_t fileiraIdx) {
    // Otimização: Usar referências constantes (const&) evita cópias grandes e acelera.
    const FileiraConfig& cfg = globalConfig.configs[fileiraIdx];
    
    // Leitura do pior sensor: Esta é a única chamada de função lenta.
    float umidadeMinima = encontrarPiorCenario(fileiraIdx); 
    
    // Mock de hora atual (para evitar bloqueio de NTP)
    // No projeto real, buscaria o tempo NTP ou RTC.
    uint8_t horaAtual = 14; // Simula 14:00h (Dia)

    // ---------------------------------------------
    // DECISÃO 1: Lógica de DESLIGAMENTO (CC Atingido)
    // ---------------------------------------------
    if (releState[fileiraIdx] && (umidadeMinima >= cfg.umidadeDesligar)) {
        releState[fileiraIdx] = false; 
        irrigacaoAgendada[fileiraIdx] = false;
        digitalWrite(cfg.relePin, LOW);
        Serial.printf("Fileira %d: Desligada. CC atingida (Umid: %.1f)\n", fileiraIdx, umidadeMinima);
        return; 
    }
    
    // ---------------------------------------------
    // DECISÃO 2: Lógica de EMERGÊNCIA (LIGAR IMEDIATAMENTE)
    // ---------------------------------------------
    if (umidadeMinima < globalConfig.umidadeEmergencia) {
        if (!releState[fileiraIdx]) {
            releState[fileiraIdx] = true; 
            irrigacaoAgendada[fileiraIdx] = false;
            digitalWrite(cfg.relePin, HIGH); 
            Serial.printf("Fileira %d: LIGADA - EMERGÊNCIA (Umid: %.1f)\n", fileiraIdx, umidadeMinima);
        }
        return; // Prioridade máxima: Sai do loop de lógica
    }

    // ---------------------------------------------
    // DECISÃO 3: Lógica de LIGAMENTO NORMAL (Agendamento Noturno)
    // ---------------------------------------------
    if (umidadeMinima < cfg.umidadeLigar) {
        bool isNightWindow = (horaAtual >= globalConfig.horaInicioNoturna && horaAtual < globalConfig.horaFimNoturna);
        
        if (isNightWindow) {
            // JANELA NOTURNA ATIVA: LIGA
            if (!releState[fileiraIdx]) {
                releState[fileiraIdx] = true;
                irrigacaoAgendada[fileiraIdx] = false;
                digitalWrite(cfg.relePin, HIGH);
                Serial.printf("Fileira %d: LIGADA - NOTURNA (Umid: %.1f)\n", fileiraIdx, umidadeMinima);
            }
        } else { 
            // FORA DA JANELA: AGENDA
            if (!releState[fileiraIdx]) {
                irrigacaoAgendada[fileiraIdx] = true;
                Serial.printf("Fileira %d: PMP atingido (%.1f). AGENDADA para %d:00h.\n", 
                              fileiraIdx, umidadeMinima, globalConfig.horaInicioNoturna);
            }
        }
    } 
    // Se a umidade melhorou, cancela o agendamento
    else if (umidadeMinima >= cfg.umidadeLigar && irrigacaoAgendada[fileiraIdx]) {
        irrigacaoAgendada[fileiraIdx] = false;
        Serial.printf("Fileira %d: Agendamento Cancelado. Umidade melhorou.\n", fileiraIdx);
    }
}

// --- 4. FUNÇÕES GLOBAIS DE INICIALIZAÇÃO ---

void setup() {
    Serial.begin(115200);
    
    // 1. Inicializa Pinos de Relé
    for (uint8_t pin : RELE_PINS) {
        pinMode(pin, OUTPUT);
        digitalWrite(pin, LOW); // Garante que todos os relés iniciam DESLIGADOS
    }
    
    // 2. Mock de Carregamento de Configurações (Lidas do Painel Web)
    // A alocação de memória do JSON é feita em uma função separada (para manter o setup limpo)
    globalConfig.umidadeEmergencia = 10.0f;
    globalConfig.horaInicioNoturna = 1;
    globalConfig.horaFimNoturna = 5;
    
    globalConfig.configs[0] = {15.0f, 40.0f, RELE_PINS[0]}; // A: Argiloso
    globalConfig.configs[1] = {15.0f, 30.0f, RELE_PINS[1]}; // B: Arenoso
    globalConfig.configs[2] = {16.0f, 32.0f, RELE_PINS[2]}; // C: Média
    globalConfig.configs[3] = {17.0f, 28.0f, RELE_PINS[3]}; // D: Fino
    
    // 3. Inicializa Estados
    for (uint8_t i = 0; i < NUM_FILEIRAS; i++) {
        releState[i] = false;
        irrigacaoAgendada[i] = false;
    }
    
    Serial.println("\n--- IrrigaSeca Firmware Otimizado (C++) Inicializado ---");
    // Inicialização de WiFi e Servidor Web viria aqui, de forma assíncrona.
}

// --- 5. LOOP PRINCIPAL (NON-BLOCKING) ---

void loop() {
    unsigned long now = millis();

    // Tarefa 1: LÓGICA RÁPIDA DE CONTROLE DE RELÉ
    if (now - ultimoCicloLogica >= 5000) { // A cada 5 segundos, reavalia
        for (uint8_t i = 0; i < NUM_FILEIRAS; i++) {
            controleRele(i);
        }
        ultimoCicloLogica = now;
    }
    
    // Tarefa 2: LEITURA LENTA DE SENSORES (Simulada para 10 minutos)
    // Otimização: A leitura não precisa ser feita a cada 5s, economizando energia.
    if (now - ultimoCicloLeitura >= 600000) { 
        // Aqui o código real leria todos os sensores, atualizaria os arrays
        // E enviaria o status (telemetria) para a dashboard web.
        Serial.println(">> CICLO DE LEITURA COMPLETO (10 min). Enviando telemetria...");
        ultimoCicloLeitura = now;
    }
    
    // NENHUM 'delay()' DEVE SER USADO AQUI!
    // A execução do servidor web, NTP, etc. ocorreria neste espaço.
}