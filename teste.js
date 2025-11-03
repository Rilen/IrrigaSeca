fetch('https://raw.githubusercontent.com/Rilen/IrrigaSeca/main/data/hortaA.log')
  .then(r => r.text())
  .then(t => { 
    const linhas = t.split('\n'); 
    console.log(linhas[0]);  // exemplo da primeira linha
    console.log(linhas[0].split(';')); // deve retornar array com 9 itens (data + 8 valores)
  })
  .catch(console.error);
