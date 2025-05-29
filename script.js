document.addEventListener('DOMContentLoaded', carregarAlunos);

function adicionarAluno() {
  const nomeInput = document.getElementById('nome');
  const fotoInput = document.getElementById('foto');
  
  const nome = nomeInput.value.trim();
  const foto = fotoInput.files[0];

  if (!nome) {
    alert("Por favor, insira o nome do aluno.");
    return;
  }

  const leitor = new FileReader();
  leitor.onload = function(e) {
    const aluno = {
      nome: nome,
      foto: e.target.result,
      estrelas: [false, false, false, false, false],
      pontos: 0
    };
    salvarAluno(aluno);
    criarAluno(aluno);
  };

  if (foto) {
    leitor.readAsDataURL(foto);
  } else {
    const aluno = {
      nome: nome,
      foto: 'https://via.placeholder.com/50',
      estrelas: [false, false, false, false, false],
      pontos: 0
    };
    salvarAluno(aluno);
    criarAluno(aluno);
  }

  nomeInput.value = '';
  fotoInput.value = '';
}

function criarAluno(aluno) {
  const alunoDiv = document.createElement('div');
  alunoDiv.className = 'aluno';

  const img = document.createElement('img');
  img.src = aluno.foto;

  const spanNome = document.createElement('span');
  spanNome.textContent = aluno.nome;

  const pontuacao = document.createElement('span');
  pontuacao.className = 'pontuacao';
  pontuacao.textContent = aluno.pontos;

  const estrelasDiv = document.createElement('div');
  estrelasDiv.className = 'estrelas';

  aluno.estrelas.forEach((ativa, i) => {
    const estrela = document.createElement('span');
    estrela.className = 'estrela';
    estrela.innerHTML = '★';
    if (ativa) estrela.classList.add('ativa');

    estrela.addEventListener('click', function() {
      aluno.estrelas[i] = !aluno.estrelas[i];
      if (aluno.estrelas[i]) {
        estrela.classList.add('ativa');
        aluno.pontos += 1;
      } else {
        estrela.classList.remove('ativa');
        aluno.pontos -= 1;
      }
      pontuacao.textContent = aluno.pontos;
      atualizarAluno(aluno);
    });

    estrelasDiv.appendChild(estrela);
  });

  const removerBtn = document.createElement('button');
  removerBtn.className = 'remover';
  removerBtn.innerHTML = '&times;';
  removerBtn.addEventListener('click', function() {
    removerAluno(aluno);
    alunoDiv.remove();
  });

  alunoDiv.appendChild(img);
  alunoDiv.appendChild(spanNome);
  alunoDiv.appendChild(pontuacao);
  alunoDiv.appendChild(estrelasDiv);
  alunoDiv.appendChild(removerBtn);

  document.getElementById('lista-alunos').appendChild(alunoDiv);
}

function salvarAluno(aluno) {
  const alunos = JSON.parse(localStorage.getItem('alunos')) || [];
  alunos.push(aluno);
  localStorage.setItem('alunos', JSON.stringify(alunos));
}

function atualizarAluno(alunoAtualizado) {
  const alunos = JSON.parse(localStorage.getItem('alunos')) || [];
  const index = alunos.findIndex(a => a.nome === alunoAtualizado.nome);
  if (index > -1) {
    alunos[index] = alunoAtualizado;
    localStorage.setItem('alunos', JSON.stringify(alunos));
  }
}

function removerAluno(alunoRemovido) {
  const alunos = JSON.parse(localStorage.getItem('alunos')) || [];
  const novosAlunos = alunos.filter(a => a.nome !== alunoRemovido.nome);
  localStorage.setItem('alunos', JSON.stringify(novosAlunos));
}

function carregarAlunos() {
  const alunos = JSON.parse(localStorage.getItem('alunos')) || [];
  alunos.forEach(aluno => criarAluno(aluno));
}
