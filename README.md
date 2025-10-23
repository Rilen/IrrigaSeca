# 💧 IrrigaSeca: Análise Preditiva de Estresse Hídrico Agrícola

## 🌾 1. Visão Geral do Projeto

Este projeto demonstra a aplicação de Ciência de Dados e Machine Learning (ML) em **Agricultura de Precisão**. O objetivo é criar um modelo preditivo capaz de identificar, com antecedência, áreas dentro de uma lavoura com **alto risco de estresse hídrico (seca)**, permitindo a otimização da irrigação, a redução de custos e a prevenção de perdas na safra.

**Demonstra Habilidades em:**
* **Domínio de Negócio:** Agronegócio e Otimização de Recursos Hídricos.
* **Geoespacial (GeoScience):** Manipulação e Análise de Imagens de Satélite (NDVI, Termografia) e Dados Climáticos.
* **Machine Learning:** Modelagem de Classificação e Regressão para Previsão de Risco.
* **Data Engineering:** Criação de *pipelines* de ETL e *Feature Engineering* especializada.

---

## 📊 2. Estrutura de Dados e Metodologia

### Stack Tecnológica
* **Linguagens:** Python
* **Geoespacial:** `Geopandas`, `Rasterio`
* **Manipulação:** `Pandas`, `NumPy`
* **Modelagem:** `Scikit-learn` (Random Forest ou Regressão Logística)
* **Visualização:** `Plotly` (para mapas de calor interativos)

### Metodologia
1.  **ETL e Dados:** Coleta e integração de dados de NDVI (Índice de Vegetação por Diferença Normalizada) via satélite e dados meteorológicos históricos.
2.  **Feature Engineering:** Criação de *lag features* (ex: chuva acumulada nas últimas semanas) essenciais para a previsão temporal.
3.  **Modelagem:** O modelo de Classificação é treinado para prever a probabilidade de um determinado talhão apresentar estresse.
4.  **Entrega:** Geração de mapas de risco preditivo na pasta `outputs/maps`.

---

## 🗺️ 3. Resultados e Insights (Showcase)

O modelo final busca uma alta acurácia na identificação de áreas vulneráveis com **antecedência de 7 a 14 dias**, um intervalo crucial para a tomada de decisão no campo.

**Resultado Principal:** O mapa de calor gerado na pasta `outputs/maps` oferece uma ferramenta visual para que o produtor rural possa implementar a **irrigação de precisão**, focando recursos apenas onde o risco é real, economizando água e energia.

> **[IMAGEM AQUI]** *Insira um print do seu mapa de calor de previsão de risco de seca ou um gráfico de resultados aqui.*

### Próximos Passos
* Implementar o modelo em um *pipeline* de *streaming* (via Kafka ou Spark Streaming).
* Explorar modelos de Deep Learning para análise de imagens de alta resolução de drones.

---

## 🚀 4. Como Executar o Projeto

1.  **Clonar o Repositório:**
    ```bash
    git clone [https://github.com/rilen/IrrigaSeca.git](https://github.com/rilen/IrrigaSeca.git)
    cd IrrigaSeca
    ```
2.  **Instalar Dependências:**
    ```bash
    pip install -r requirements.txt
    ```
3.  **Executar o Notebook de Análise:**
    Abra o `notebooks/1.0_eda_limpeza.ipynb` para entender o fluxo de dados e, em seguida, o `2.0_modelagem_ml.ipynb` para o treinamento.

---

**Desenvolvido por Rilen - [Visite meu Portfólio Completo](https://rilen.github.io/portfolio/)**