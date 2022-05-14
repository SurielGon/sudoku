"use strict";

//muda todos os inputs pra fundo branco
function changebgwhite() {
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      document.getElementById(`xy${x}${y}`).style.backgroundColor = "white";
    }
  }
}

//altera o fundo de todos os inputs para a cor amarela
function changebgColor() {
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      document.getElementById(`xy${x}${y}`).style.backgroundColor = "#fdd85d";
    }
  }
}

//criar um delay entre algumas funções
const sleep = (milliseconds) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
};

//conta quantos numeros (1-9) existem na matriz e retorna
function countn(num, arr) {
  let c = 0;
  for (let n of arr) {
    if (n == num) {
      c += 1;
    }
  }
  return c;
}

//cria um grid 9x9
function createboard() {
  const parentdiv = document.getElementById("board"); //esse id tá na tag form
  let i = "";

  //cria 81 entradas e aplica um css
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if ((x != 0) & (y != 0) & (x % 3 == 0) & (y % 3 == 0)) {
        i += `<input id="xy${x}${y}" class="firstInput" type="number" min="1" max="9"/>`;
      } else if ((y != 0) & (y % 3 == 0)) {
        i += `<input id="xy${x}${y}" class="secondInput" type="number" min="1" max="9"/>`;
      } else if ((x != 0) & (x % 3 == 0)) {
        i += `<input id="xy${x}${y}" class="thirdInput" type="number" min="1" max="9"/>`;
      } else {
        i += `<input id="xy${x}${y}" class="fourthInput" type="number" min="1" max="9"/>`;
      }
    }
  }
  parentdiv.innerHTML = i;
}

//função chamada ao clicar em Resolver
//verificará se o sudoku é válido e resolve
const start = async () => {
  //desativa os botões quando começa a resolver o sudoku
  document.getElementById("startbtn").disabled = true;
  document.getElementById("resetbtn").disabled = true;
  document.getElementById("generatepuzzlebtn").disabled = true;
  await sleep(500);
  changebgwhite();
  let puzzle = getpuzzle();
  //sudoku só é resolvido se for válido ou tenha pelo menos uma solução
  if (validBoard(puzzle)) {
    const solved = solve(getpuzzle());
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (puzzle[y][x] == "") {
          document.getElementById(`xy${x}${y}`).style.backgroundColor =
            "#D4DBE8";
          document.getElementById(`xy${x}${y}`).value = solved[y][x];
          await sleep(40);
        }
      }
    }
    document.getElementById("startbtn").disabled = false;
    document.getElementById("resetbtn").disabled = false;
    document.getElementById("generatepuzzlebtn").disabled = false;
  }
  //se não for válido, habilita os botões e nada acontece
  else {
    document.getElementById("startbtn").disabled = false;
    document.getElementById("resetbtn").disabled = false;
    document.getElementById("generatepuzzlebtn").disabled = false;
  }
};

//obtem todos os 81 valores de entrada e retorna em uma matriz
function getpuzzle() {
  let puzzle = [];
  let t = [];
  for (let y = 0; y < 9; y++) {
    t = [];
    for (let x = 0; x < 9; x++) {
      t.push(document.getElementById(`xy${x}${y}`).value);
    }
    puzzle.push(t);
  }
  return puzzle;
}

//verifica se o sudoku atual tem pelo menos uma solução válida
function validBoard(board) {
  //verifica cada quadrado e verifica se seus valores são válidos
  //válido significa que eles são únicos em suas linhas, colunas e no quadrado 3x3, retorna verdadeiro
  //tudo que não for um espaço vazio ou valores entre 1 e 9 é considerado entrada inválida e retorna falso também
  //se inválido muda bg e retorna false
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if ((board[y][x] == "0") | (board[y][x].length > 1)) {
        changebgColor();
        return false;
      }
    }
  }

  let square = [];
  for (let y = 0; y < 7; y += 3) {
    for (let x = 0; x < 7; x += 3) {
      square = board[y]
        .slice(x, x + 3)
        .concat(board[y + 1].slice(x, x + 3), board[y + 2].slice(x, x + 3));
      for (let n = 1; n < 10; n++) {
        if (countn(n, square) > 1) {
          changebgColor();
          return false;
        }
      }
    }
  }

  for (let y of board) {
    for (let n = 1; n < 10; n++) {
      if (countn(n, y) > 1) {
        changebgColor();
        return false;
      }
    }
  }

  let column = [];
  for (let x = 0; x < 9; x++) {
    column = [];
    for (let y = 0; y < 9; y++) {
      column.push(board[y][x]);
    }
    for (let n = 1; n < 10; n++) {
      if (countn(n, column) > 1) {
        changebgColor();
        return false;
      }
    }
  }

  return true;
}

//função chamada para resolver o sudoku se tiver pelo menos uma solução válida
function solve(puzzle) {
  let m = 0;
  let n = 0;

  //m, n será a posição x, y da última entrada vazia no sudoku
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (puzzle[y][x] == "") {
        m = x;
        n = y;
      }
    }
  }

  //resolve o sudoku com backtracking
  function sudoku(puzzle, m, n) {
    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (puzzle[y][x] == "") {
          for (let v = 1; v < 10; v++) {
            if (check(x, y, v.toString(), puzzle)) {
              puzzle[y][x] = v.toString();
              sudoku(puzzle, m, n);
              if (puzzle[n][m] != "") {
                //se a entrada da posição m, n não estiver vazia, significa que o sudoku foi resolvido (m, n é a última posição vazia na matriz original)
                return puzzle; //retorna o sudoku resolvido
              }
              puzzle[y][x] = "";
            }
          }
          return null;
        }
      }
    }
  }

  return sudoku(puzzle, m, n);
}

function check(x, y, v, sudoku) {
  //verifica se o valor v na posição x, y é único na coluna, na linha e na grade quadrada 3x3
  //se não for único retorna falso, se não for único retorna verdadeiro
  let xi = Math.floor(x / 3) * 3;
  let yi = Math.floor(y / 3) * 3;

  for (let row = 0; row < 3; row++) {
    if (sudoku[yi + row].slice(xi, xi + 3).includes(v)) {
      return false;
    }
  }

  if (sudoku[y].includes(v)) {
    return false;
  } else {
    for (let row of sudoku) {
      if (row[x] == v) {
        return false;
      }
    }
  }

  return true;
}

//gera um sudoku aleatório com pelo menos uma solução válida
const generatepuzzle = async () => {
  //desativar botões quando começa a gerar quebra-cabeça
  document.getElementById("startbtn").disabled = true;
  document.getElementById("resetbtn").disabled = true;
  document.getElementById("generatepuzzlebtn").disabled = true;
  let emptypuzzle = [
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
  ];

  let p = [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0],
    [6, 0],
    [7, 0],
    [8, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1],
    [5, 1],
    [6, 1],
    [7, 1],
    [8, 1],
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [6, 2],
    [7, 2],
    [8, 2],
    [0, 3],
    [1, 3],
    [2, 3],
    [3, 3],
    [4, 3],
    [5, 3],
    [6, 3],
    [7, 3],
    [8, 3],
    [0, 4],
    [1, 4],
    [2, 4],
    [3, 4],
    [4, 4],
    [5, 4],
    [6, 4],
    [7, 4],
    [8, 4],
    [0, 5],
    [1, 5],
    [2, 5],
    [3, 5],
    [4, 5],
    [5, 5],
    [6, 5],
    [7, 5],
    [8, 5],
    [0, 6],
    [1, 6],
    [2, 6],
    [3, 6],
    [4, 6],
    [5, 6],
    [6, 6],
    [7, 6],
    [8, 6],
    [0, 7],
    [1, 7],
    [2, 7],
    [3, 7],
    [4, 7],
    [5, 7],
    [6, 7],
    [7, 7],
    [8, 7],
    [0, 8],
    [1, 8],
    [2, 8],
    [3, 8],
    [4, 8],
    [5, 8],
    [6, 8],
    [7, 8],
    [8, 8],
  ];

  let r = 0;
  for (let n = 1; n < 10; n++) {
    r = Math.floor(Math.random() * p.length);
    emptypuzzle[p[r][1]][p[r][0]] = n.toString(); //adicionando de 1 a 9 em lugares aleatórios em um tabuleiro vazio
    p.splice(r, 1);
  }

  emptypuzzle = solve(emptypuzzle); //resolve com 9 números

  for (let n = 0; n < 70; n++) {
    emptypuzzle[Math.floor(Math.random() * 9)][Math.floor(Math.random() * 9)] =
      ""; //1 a 70 lugares ficarão vazios
  }

  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      document.getElementById(`xy${x}${y}`).style.backgroundColor = "white"; //preenche o grid com alguns espaços vazios
      document.getElementById(`xy${x}${y}`).value = emptypuzzle[y][x];
      await sleep(20);
    }
  }
  document.getElementById("startbtn").disabled = false;
  document.getElementById("resetbtn").disabled = false;
  document.getElementById("generatepuzzlebtn").disabled = false;
};

//redefine o grid, deixando todas as entradas vazias
const reset = async () => {
  document.getElementById("startbtn").disabled = true;
  document.getElementById("resetbtn").disabled = true;
  document.getElementById("generatepuzzlebtn").disabled = true;
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      document.getElementById(`xy${x}${y}`).style.backgroundColor = "white";
      document.getElementById(`xy${x}${y}`).value = "";
      await sleep(20);
    }
  }
  document.getElementById("startbtn").disabled = false;
  document.getElementById("resetbtn").disabled = false;
  document.getElementById("generatepuzzlebtn").disabled = false;
};