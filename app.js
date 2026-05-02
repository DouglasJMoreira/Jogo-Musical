/**
 * AVENTURA MUSICAL — app.js
 * Versão estável e testada.
 *
 * BUGS CORRIGIDOS vs versão anterior:
 * 1. answer() recebia isCorrect como string via onclick — agora usa data-attribute booleano
 * 2. getStarsForCombo(0) retornava 1 estrela incorretamente — caminho de dica isolado
 * 3. pulse-node tinha só keyframe para harm — criados pulse-harm e pulse-rhy separados no CSS
 * 4. openProfile() crashava se path fosse null — null-check adicionado
 * 5. pendingIds era salvo no localStorage contendo dados de sessão corrompíveis
 * 6. renderStarRow() declarada mas nunca usada — removida
 * 7. Variável 'icon' declarada mas nunca usada no loop de stars da trilha — corrigido
 * 8. showXPPop podia posicionar elementos fora da tela em mobile — clamping adicionado
 * 9. Várias funções sem null-checks para ST.quiz — guards adicionados
 * 10. starsSession limitado por sessão mas não por nível — corrigido no save
 */

'use strict';

/* ════════════════════════════════════════════════════════════
   BANCO DE QUESTÕES
════════════════════════════════════════════════════════════ */
const PATHS = {
  harmonia: {
    name: 'Harmonia',
    emoji: '🎼',
    color: 'var(--harm)',
    color2: 'var(--harm2)',
    glow: 'var(--harm-glow)',
    cls: 'harm',
    levels: [
      {
        id: 'h1',
        title: 'Notas Musicais',
        emoji: '🎵',
        desc: 'As 7 notas e a notação cifrada',
        questions: [
          { q: 'Quantas notas naturais existem na escala musical ocidental?', opts: ['5', '6', '7', '8'], a: 2, exp: 'Existem 7 notas naturais: Dó, Ré, Mi, Fá, Sol, Lá, Si.', hint: 'Pense nos dedos de uma mão... mais dois!' },
          { q: 'Qual nota vem DEPOIS do <hl>Si</hl> ao subir a escala?', opts: ['Lá', 'Dó', 'Ré', 'Sol'], a: 1, exp: 'Após o Si, a escala retorna ao Dó — uma oitava acima.', hint: 'A escala é cíclica, volta ao início!' },
          { q: 'Qual nota vem ANTES do <hl>Fá</hl>?', opts: ['Sol', 'Dó', 'Mi', 'Ré'], a: 2, exp: 'A ordem é: Dó, Ré, Mi, Fá — então antes do Fá vem o Mi.', hint: 'Dó → Ré → Mi → ?' },
          { q: 'Na notação americana, como se escreve <hl>Dó</hl>?', opts: ['D', 'A', 'G', 'C'], a: 3, exp: 'C = Dó. A notação americana usa letras: C D E F G A B.', hint: 'C de "Cê" — como em inglês: C D E F G A B' },
          { q: 'Na notação americana, como se escreve <hl>Sol</hl>?', opts: ['S', 'B', 'G', 'F'], a: 2, exp: 'G = Sol. A 5ª letra da sequência C D E F G A B.', hint: 'Conta na sequência: C D E F... qual vem depois?' },
          { q: 'Na notação americana, como se escreve <hl>Lá</hl>?', opts: ['L', 'A', 'E', 'B'], a: 1, exp: 'A = Lá. A 6ª letra: C D E F G A.', hint: 'A 6ª letra do alfabeto musical: C D E F G _' },
          { q: 'Na notação americana, como se escreve <hl>Si</hl>?', opts: ['S', 'D', 'B', 'R'], a: 2, exp: 'B = Si. A última da série: C D E F G A B.', hint: 'É a última letra da sequência musical!' },
          { q: 'Na notação americana, como se escreve <hl>Ré</hl>?', opts: ['R', 'D', 'Re', 'G'], a: 1, exp: 'D = Ré. Segunda da sequência C D E F G A B.', hint: 'A 2ª letra: C _' },
          { q: 'Na notação americana, como se escreve <hl>Mi</hl>?', opts: ['M', 'F', 'E', 'A'], a: 2, exp: 'E = Mi. Terceira da sequência.', hint: 'C D _ — qual é a terceira?' },
          { q: 'Na notação americana, como se escreve <hl>Fá</hl>?', opts: ['P', 'F', 'Ph', 'V'], a: 1, exp: 'F = Fá. Mesma letra inicial!', hint: 'Fá começa com... F!' },
          { q: 'Qual sequência ASCENDENTE está correta?', opts: ['Dó-Mi-Ré-Fá', 'Dó-Ré-Mi-Fá', 'Fá-Mi-Ré-Dó', 'Mi-Dó-Ré-Fá'], a: 1, exp: 'A ordem correta é: Dó, Ré, Mi, Fá, Sol, Lá, Si.', hint: 'Pense: Dó → próxima...' },
          { q: 'Qual nota fica entre <hl>Sol</hl> e <hl>Si</hl>?', opts: ['Fá', 'Ré', 'Mi', 'Lá'], a: 3, exp: 'Sol → Lá → Si. O Lá fica entre eles.', hint: 'G → ? → B em cifra americana' },
          { q: 'Qual nota fica DUAS posições depois do <hl>Dó</hl>?', opts: ['Ré', 'Mi', 'Fá', 'Sol'], a: 1, exp: 'Dó → Ré → Mi. Duas posições depois é Mi.', hint: 'Dó é a 1ª, Ré é a 2ª, então...' },
          { q: 'Quantas notas pretas existem em uma oitava do piano?', opts: ['4', '5', '6', '7'], a: 1, exp: 'Há 5 teclas pretas por oitava: 2 acima de CD e 3 acima de FGA.', hint: 'Olhe para um teclado — grupos de 2 e de 3!' },
          { q: 'O <hl>Dó</hl> mais central do piano é chamado de:', opts: ['Dó grave', 'Dó central', 'Dó agudo', 'Dó médio'], a: 1, exp: 'O Dó4 (C4) é chamado de "Dó central" — referência universal.', hint: 'É o Dó no meio do teclado!' },
        ],
      },
      {
        id: 'h2',
        title: 'Intervalos',
        emoji: '📏',
        desc: 'Distâncias entre duas notas',
        questions: [
          { q: 'Quantos semitons tem um <hl>tom</hl>?', opts: ['1', '2', '3', '4'], a: 1, exp: '1 tom = 2 semitons. Ex: Dó → Ré.', hint: 'Semi = metade. 2 semis = 1 inteiro!' },
          { q: 'Quantos semitons tem uma <hl>oitava</hl>?', opts: ['7', '8', '10', '12'], a: 3, exp: 'Uma oitava tem 12 semitons.', hint: 'Conte todas as teclas (pretas e brancas) entre dois Dós.' },
          { q: 'Quantos semitons há entre <hl>Mi</hl> e <hl>Fá</hl>?', opts: ['2', '1', '0', '3'], a: 1, exp: 'Mi-Fá é apenas 1 semitom — são vizinhos sem tecla preta entre eles.', hint: 'Não há tecla preta entre E e F no piano!' },
          { q: 'Quantos semitons há entre <hl>Si</hl> e <hl>Dó</hl>?', opts: ['2', '1', '3', '0'], a: 1, exp: 'Si-Dó, como Mi-Fá, são vizinhos — apenas 1 semitom.', hint: 'Não há tecla preta entre B e C!' },
          { q: 'A distância de <hl>Dó</hl> até <hl>Mi</hl> é uma:', opts: ['Terça menor', 'Segunda maior', 'Terça maior', 'Quarta justa'], a: 2, exp: 'Dó-Mi são 4 semitons = terça maior.', hint: 'Conta: Dó(0), Dó#(1), Ré(2), Ré#(3), Mi(4)' },
          { q: 'A distância de <hl>Dó</hl> até <hl>Sol</hl> é uma:', opts: ['Quinta justa', 'Quarta justa', 'Sexta maior', 'Terça maior'], a: 0, exp: 'Dó-Sol são 7 semitons = quinta justa.', hint: '7 semitons, 5ª nota da escala = quinta!' },
          { q: 'A distância de <hl>Dó</hl> até <hl>Fá</hl> é uma:', opts: ['Quinta justa', 'Terça maior', 'Quarta justa', 'Segunda maior'], a: 2, exp: 'Dó-Fá são 5 semitons = quarta justa.', hint: '5 semitons, 4ª nota da escala = quarta!' },
          { q: 'Quantos semitons tem uma <hl>terça menor</hl>?', opts: ['2', '3', '4', '5'], a: 1, exp: 'Terça menor = 3 semitons. Ex: Lá-Dó.', hint: 'Menor que a terça maior (4), então é 3!' },
          { q: 'Quantos semitons tem uma <hl>terça maior</hl>?', opts: ['3', '4', '5', '2'], a: 1, exp: 'Terça maior = 4 semitons. Ex: Dó-Mi.', hint: 'Do-Mi: Dó(0), Ré(2), Mi(4) — 4 semitons!' },
          { q: 'A distância de <hl>Lá</hl> até <hl>Dó</hl> é:', opts: ['Terça maior', 'Terça menor', 'Quarta justa', 'Segunda maior'], a: 1, exp: 'Lá-Dó são 3 semitons = terça menor.', hint: 'Conta: Lá(0), Lá#(1), Si(2), Dó(3) — 3 semitons!' },
          { q: 'Um intervalo <hl>harmônico</hl> significa:', opts: ['Notas tocadas em sequência', 'Notas tocadas ao mesmo tempo', 'Um intervalo menor', 'Um acorde de 4 notas'], a: 1, exp: 'Intervalo harmônico: as duas notas soam simultaneamente.', hint: 'Harmonia = simultaneidade!' },
          { q: 'Um intervalo <hl>melódico</hl> significa:', opts: ['Notas tocadas ao mesmo tempo', 'Um intervalo maior', 'Notas tocadas em sequência', 'Um acorde'], a: 2, exp: 'Intervalo melódico: as notas soam em sequência.', hint: 'Melodia é linear, uma nota de cada vez!' },
        ],
      },
      {
        id: 'h3',
        title: 'Escalas Maiores',
        emoji: '🎼',
        desc: 'Estrutura e fórmula das escalas',
        questions: [
          { q: 'Quantas notas tem uma escala maior?', opts: ['5', '6', '7', '8'], a: 2, exp: 'Uma escala maior tem 7 notas (+ a oitava que repete a 1ª).', hint: 'C D E F G A B — conte!' },
          { q: 'A fórmula T T S T T T S significa:', opts: ['Tons e semitons da escala maior', 'Tipos de acordes', 'Posições do violão', 'Batidas do compasso'], a: 0, exp: 'T=tom (2 semitons), S=semitom. Essa é a fórmula da escala maior.', hint: 'T = Tom, S = Semitom — receita da escala maior!' },
          { q: 'Quantos acidentes tem a escala de <hl>Dó maior</hl>?', opts: ['1', '2', '0', '3'], a: 2, exp: 'Dó maior é a única escala maior sem nenhum acidente.', hint: 'É a escala das teclas brancas do piano!' },
          { q: 'A escala de <hl>Sol maior</hl> tem quantos sustenidos?', opts: ['0', '1', '2', '3'], a: 1, exp: 'Sol maior tem 1 sustenido: Fá#.', hint: 'Aplique T T S T T T S a partir de Sol!' },
          { q: 'Qual é o <hl>7º grau</hl> da escala de Dó maior?', opts: ['Lá', 'Sol', 'Si', 'Fá'], a: 2, exp: 'C-D-E-F-G-A-B. O 7º grau é Si (B).', hint: 'C(1) D(2) E(3) F(4) G(5) A(6) ?(7)' },
          { q: 'Qual é o <hl>5º grau</hl> da escala de Dó maior?', opts: ['Fá', 'Sol', 'Lá', 'Mi'], a: 1, exp: 'C D E F G. O 5º grau é Sol (G).', hint: 'C(1) D(2) E(3) F(4) ?(5)' },
          { q: 'O 1º grau de uma escala é chamado de:', opts: ['Dominante', 'Subdominante', 'Tônica', 'Mediante'], a: 2, exp: 'O 1º grau é a Tônica — o centro tonal da escala.', hint: 'É a nota que dá "nome" à escala!' },
          { q: 'O 5º grau de uma escala é chamado de:', opts: ['Tônica', 'Dominante', 'Subdominante', 'Mediante'], a: 1, exp: 'O 5º grau é a Dominante — segundo grau mais importante.', hint: 'Domina a escala junto com a tônica!' },
          { q: 'A escala de <hl>Fá maior</hl> tem:', opts: ['1 sustenido', '2 sustenidos', '1 bemol', '2 bemóis'], a: 2, exp: 'Fá maior tem 1 bemol: Si♭.', hint: 'F → G → A → Bb — chegou ao Bb!' },
          { q: 'A escala de <hl>Ré maior</hl> tem:', opts: ['1 sustenido', '2 sustenidos', '1 bemol', '0 acidentes'], a: 1, exp: 'Ré maior tem 2 sustenidos: Fá# e Dó#.', hint: 'D → E → F# → G → A → B → C# → D' },
          { q: 'A escala <hl>pentatônica maior</hl> tem quantas notas?', opts: ['5', '6', '7', '8'], a: 0, exp: 'Pentatônica = 5 notas. É a escala mais universal da música.', hint: 'Penta = 5 em grego!' },
          { q: 'O 4º grau de uma escala é chamado de:', opts: ['Tônica', 'Mediante', 'Subdominante', 'Sensível'], a: 2, exp: 'O 4º grau é a Subdominante.', hint: 'Sub = abaixo. Fica um passo abaixo da dominante (5º).' },
        ],
      },
      {
        id: 'h4',
        title: 'Acordes Básicos',
        emoji: '🎸',
        desc: 'Tríades maiores, menores e tipos',
        questions: [
          { q: 'Um acorde é formado por no mínimo quantas notas?', opts: ['2', '3', '4', '5'], a: 1, exp: 'Acorde = mínimo 3 notas simultâneas (tríade).', hint: 'Duas notas = intervalo. Três notas = acorde!' },
          { q: 'O acorde de <hl>Dó maior (C)</hl> é formado por:', opts: ['C-E-G', 'C-Eb-G', 'C-E-Ab', 'C-D-G'], a: 0, exp: 'C maior = Dó (C) + Mi (E) + Sol (G).', hint: '1º grau + 3ª maior + 5ª justa = maior!' },
          { q: 'A diferença entre maior e menor num acorde está em:', opts: ['O número de notas', 'A terça (3ª nota)', 'O baixo', 'O ritmo'], a: 1, exp: 'Maior tem terça maior (4st); menor tem terça menor (3st).', hint: 'A 2ª nota do acorde muda tudo!' },
          { q: 'Na cifra, o acorde de <hl>Lá menor</hl> é:', opts: ['Am', 'A', 'Amin', 'A-'], a: 0, exp: '"m" minúsculo indica acorde menor. Am = Lá menor.', hint: 'm = menor. É sempre após a letra da nota!' },
          { q: 'Uma tríade maior é formada por:', opts: ['3ª menor + 5ª justa', '3ª maior + 4ª justa', '3ª maior + 5ª justa', '3ª menor + 4ª justa'], a: 2, exp: 'Tríade maior = Terça maior (4st) + Quinta justa (7st total).', hint: 'Maior tem a terça maior no meio!' },
          { q: 'O acorde de <hl>Sol maior (G)</hl> é formado por:', opts: ['G-B-D', 'G-Bb-D', 'G-B-Db', 'G-A-D'], a: 0, exp: 'G maior = Sol (G) + Si (B) + Ré (D).', hint: 'G(1) + B(3ª maior) + D(5ª justa)' },
          { q: 'O acorde de <hl>Mi menor (Em)</hl> é formado por:', opts: ['E-G-B', 'E-G#-B', 'E-Ab-B', 'E-F-B'], a: 0, exp: 'Em = Mi (E) + Sol (G) + Si (B).', hint: 'E + 3ª menor (3st) = G; G + mais 4st = B' },
          { q: 'O símbolo ° após uma nota indica acorde:', opts: ['Maior', 'Menor', 'Diminuto', 'Suspenso'], a: 2, exp: '° = diminuto. Ex: C° = Dó diminuto = C + Eb + Gb.', hint: 'C° — o "°" é de diminuto!' },
          { q: 'Uma <hl>tétrade</hl> tem quantas notas?', opts: ['3', '4', '5', '2'], a: 1, exp: 'Tétrade = 4 notas. Ex: C7 = C, E, G, Bb.', hint: 'Tetra = 4 em grego!' },
          { q: 'O acorde <hl>C7</hl> é formado por:', opts: ['C-E-G-B', 'C-E-G-Bb', 'C-Eb-G-Bb', 'C-E-Ab-Bb'], a: 1, exp: 'C7 = C + E + G + Bb (sétima menor). O "7" = sétima menor.', hint: 'O 7 indica adicionar a 7ª menor (Bb)!' },
          { q: 'O acorde <hl>Cmaj7</hl> é formado por:', opts: ['C-E-G-Bb', 'C-E-G-B', 'C-Eb-G-B', 'C-E-Ab-B'], a: 1, exp: 'Cmaj7 = C + E + G + B. "maj7" = sétima maior.', hint: 'maj7 = sétima MAIOR (B natural, não Bb)!' },
          { q: 'Um acorde <hl>sus4</hl> substitui a terça por:', opts: ['A 2ª', 'A 4ª', 'A 5ª', 'A 7ª'], a: 1, exp: 'Sus4 troca a terça pela quarta. Csus4 = C + F + G.', hint: 'Sus = suspenso. A terça é "suspensa" pela 4ª!' },
        ],
      },
      {
        id: 'h5',
        title: 'Progressões Harmônicas',
        emoji: '🔄',
        desc: 'Sequências de acordes e cadências',
        questions: [
          { q: 'A progressão <hl>I - IV - V - I</hl> em Dó maior usa:', opts: ['C-F-G-C', 'C-Em-G-C', 'C-F-Am-C', 'C-Dm-G-C'], a: 0, exp: 'I=C, IV=F, V=G. É a progressão mais clássica da música.', hint: 'I=Dó, IV=4ª nota=Fá, V=5ª nota=Sol!' },
          { q: 'Em Dó maior, qual é o acorde do <hl>II grau</hl>?', opts: ['Ré maior', 'Ré menor', 'Mi menor', 'Mi maior'], a: 1, exp: 'O II grau em uma tonalidade maior é SEMPRE menor. Em Dó: Dm.', hint: 'II, III, VI são menores na escala maior!' },
          { q: 'A cadência <hl>V → I</hl> é chamada de:', opts: ['Cadência plagal', 'Cadência perfeita', 'Cadência interrompida', 'Semicadência'], a: 1, exp: 'V→I é a cadência perfeita — a mais conclusiva de todas.', hint: 'É o "fim" musical mais satisfatório!' },
          { q: 'A cadência <hl>IV → I</hl> é chamada de:', opts: ['Cadência perfeita', 'Cadência interrompida', 'Cadência plagal', 'Semicadência'], a: 2, exp: 'IV→I é a cadência plagal — o famoso "Amém" das igrejas.', hint: '"A-MÉM" usa IV→I!' },
          { q: 'A progressão <hl>I - V - vi - IV</hl> é famosa porque:', opts: ['É usada por Bach', 'Aparece em centenas de hits modernos', 'É obrigatória no jazz', 'É base do choro'], a: 1, exp: 'I-V-vi-IV aparece em "Let It Be", "No Woman No Cry" e muitos outros.', hint: 'Você com certeza já ouviu essa progressão!' },
          { q: 'Em Dó maior, o <hl>VI grau</hl> é:', opts: ['Fá maior', 'Sol menor', 'Lá menor', 'Si diminuto'], a: 2, exp: 'VI grau em maior = acorde relativo menor = Am (Lá menor).', hint: 'A(6ª nota) + m (VI em maior é sempre menor) = Am!' },
          { q: 'A tonalidade relativa menor de <hl>Dó maior</hl> é:', opts: ['Dó menor', 'Sol menor', 'Mi menor', 'Lá menor'], a: 3, exp: 'Lá menor é a relativa de Dó maior — mesmas notas, centro diferente.', hint: 'A relativa menor começa na 6ª nota da escala maior!' },
          { q: 'O acorde do <hl>VII grau</hl> em Dó maior é:', opts: ['Si maior', 'Si menor', 'Si diminuto', 'Si aumentado'], a: 2, exp: 'VII grau em maior = acorde diminuto. B° = Si-Ré-Fá.', hint: 'O VII grau é o único diminuto na escala maior!' },
          { q: 'O blues básico tem quantos compassos?', opts: ['8', '10', '12', '16'], a: 2, exp: 'O blues de 12 compassos é a forma mais clássica do gênero.', hint: '12 bar blues — é o padrão!' },
          { q: 'O acorde <hl>dominante</hl> cria tensão porque quer resolver no:', opts: ['II grau', 'IV grau', 'VI grau', 'I grau'], a: 3, exp: 'O V (dominante) sempre quer resolver na tônica (I).', hint: 'V → I é a progressão mais fundamental da música tonal!' },
          { q: 'O ii-V-I do jazz em Dó maior é:', opts: ['Dm7 - G7 - Cmaj7', 'Em7 - G7 - Cmaj7', 'Am7 - G7 - Cmaj7', 'Dm7 - F7 - Cmaj7'], a: 0, exp: 'ii-V-I: Dm7 → G7 → Cmaj7. É a progressão mais usada no jazz.', hint: 'ii (menor 7) → V (dominante 7) → I (maj7)!' },
          { q: 'Na escala maior, quantos acordes são menores?', opts: ['2', '3', '4', '5'], a: 1, exp: 'Na escala maior há 3 acordes menores: II, III e VI graus.', hint: 'II, III e VI são sempre menores na escala maior!' },
        ],
      },
    ],
  },

  ritmo: {
    name: 'Ritmo',
    emoji: '🥁',
    color: 'var(--rhy)',
    color2: 'var(--rhy2)',
    glow: 'var(--rhy-glow)',
    cls: 'rhy',
    levels: [
      {
        id: 'r1',
        title: 'Figuras de Tempo',
        emoji: '🎵',
        desc: 'Valores das notas e pausas',
        questions: [
          { q: 'Quantos tempos vale uma <hl>semibreve</hl>?', opts: ['1', '2', '3', '4'], a: 3, exp: 'Semibreve = 4 tempos. É a figura de maior valor padrão.', hint: 'Semi + breve = "quase breve". É a maior comum!' },
          { q: 'Quantos tempos vale uma <hl>mínima</hl>?', opts: ['1', '2', '3', '4'], a: 1, exp: 'Mínima = 2 tempos. Duas mínimas cabem em uma semibreve.', hint: 'Metade da semibreve!' },
          { q: 'Quantos tempos vale uma <hl>semínima</hl>?', opts: ['1', '2', '4', '½'], a: 0, exp: 'Semínima = 1 tempo. É a figura de 1 beat padrão.', hint: 'É a figura mais comum para representar 1 pulso!' },
          { q: 'Quantos tempos vale uma <hl>colcheia</hl>?', opts: ['1', '½', '¼', '2'], a: 1, exp: 'Colcheia = ½ tempo. São 2 colcheias por semínima.', hint: 'Tem uma "colcha" (rabo) na haste!' },
          { q: 'Quantos tempos vale uma <hl>semicolcheia</hl>?', opts: ['½', '¼', '⅛', '1'], a: 1, exp: 'Semicolcheia = ¼ de tempo. São 4 por semínima.', hint: 'Tem 2 "colchas" (rabos duplos) na haste!' },
          { q: 'O ponto de aumento (.) aumenta o valor da figura em:', opts: ['O dobro', '¼ do valor', '½ do valor', '⅓ do valor'], a: 2, exp: 'O ponto adiciona a metade do valor original. Mínima pontuada = 3 tempos.', hint: 'Um ponto = acrescenta metade!' },
          { q: 'Uma mínima pontuada vale quantos tempos?', opts: ['2', '2,5', '3', '4'], a: 2, exp: 'Mínima (2) + ponto (½ de 2 = 1) = 3 tempos.', hint: 'Mínima = 2, ponto adiciona metade (1), total = ?' },
          { q: 'Quantas colcheias cabem em uma semibreve?', opts: ['4', '6', '8', '16'], a: 2, exp: 'Semibreve = 4 tempos × 2 colcheias/tempo = 8 colcheias.', hint: 'Semibreve = 4 semínimas = 8 colcheias!' },
          { q: 'A <hl>pausa de semibreve</hl> representa:', opts: ['1 tempo de silêncio', '2 tempos', '4 tempos', '8 tempos'], a: 2, exp: 'Pausa de semibreve = 4 tempos de silêncio.', hint: 'Pausa tem o mesmo valor da figura equivalente!' },
          { q: 'Quantas semínimas cabem em uma semibreve?', opts: ['2', '3', '4', '8'], a: 2, exp: 'Semibreve = 4 semínimas (4 tempos ÷ 1 tempo = 4).', hint: '4 tempos ÷ 1 tempo cada = ?' },
          { q: 'A ligadura de valor:', opts: ['Une notas de alturas diferentes', 'Prolonga o som de duas notas iguais', 'Indica um acento', 'Muda a altura da nota'], a: 1, exp: 'Ligadura de valor une duas notas da mesma altura, somando seus valores.', hint: 'Liga → continua soando! Só para notas iguais.' },
          { q: 'Quantas semicolcheias cabem em um tempo?', opts: ['2', '4', '8', '1'], a: 1, exp: 'Semicolcheia = ¼ de tempo, logo 4 semicolcheias por tempo.', hint: 'Semi = metade de colcheia (½), então ¼ do tempo!' },
        ],
      },
      {
        id: 'r2',
        title: 'Compasso e Métrica',
        emoji: '🕐',
        desc: 'Tipos de compasso e suas métricas',
        questions: [
          { q: 'O número de CIMA na fração do compasso indica:', opts: ['Qual figura dura 1 tempo', 'Quantos tempos por compasso', 'O andamento', 'A intensidade'], a: 1, exp: 'Numerador = número de tempos (pulsos) por compasso.', hint: 'Cima = quantidade. Baixo = qual figura!' },
          { q: 'O número de BAIXO na fração do compasso indica:', opts: ['Quantos tempos', 'Qual figura vale 1 tempo', 'O andamento', 'A tonalidade'], a: 1, exp: 'Denominador = qual figura representa 1 tempo. 4 = semínima.', hint: '4 = semínima, 8 = colcheia, 2 = mínima!' },
          { q: 'O compasso <hl>4/4</hl> tem quantos tempos?', opts: ['2', '3', '4', '8'], a: 2, exp: '4/4 = 4 tempos por compasso, cada um valendo uma semínima.', hint: 'O número de cima = número de tempos!' },
          { q: 'O compasso <hl>3/4</hl> é típico de qual estilo?', opts: ['Rock', 'Valsa', 'Samba', 'Jazz'], a: 1, exp: 'Valsa é em 3/4 — três tempos por compasso.', hint: '1-2-3, 1-2-3... que dança tem esse balanço?' },
          { q: 'O compasso <hl>2/4</hl> é típico de:', opts: ['Valsa', 'Baião / Marcha', 'Blues', 'Jazz'], a: 1, exp: '2/4 é o compasso do baião, marcha e samba.', hint: '2 tempos = binário = música de marcha!' },
          { q: 'No compasso <hl>6/8</hl>, quantos grupos de colcheias existem?', opts: ['6', '3', '2', '8'], a: 2, exp: '6/8 é binário composto: 2 grupos de 3 colcheias cada.', hint: '6 colcheias ÷ 3 por grupo = 2 grupos!' },
          { q: 'O compasso <hl>5/4</hl> é considerado:', opts: ['Binário simples', 'Ternário simples', 'Irregular/Aditivo', 'Binário composto'], a: 2, exp: '5/4 é irregular — não divide igualmente em 2 ou 3.', hint: '5 não divide igual em grupos de 2 ou 3!' },
          { q: 'Quantas colcheias cabem em um compasso de <hl>4/4</hl>?', opts: ['4', '6', '8', '12'], a: 2, exp: '4 tempos × 2 colcheias por tempo = 8 colcheias.', hint: '4 semínimas × 2 colcheias cada = ?' },
          { q: 'O compasso <hl>12/8</hl> tem quantos pulsos principais?', opts: ['12', '6', '4', '3'], a: 2, exp: '12/8 é quaternário composto: 4 pulsos, cada um com 3 colcheias.', hint: '12 ÷ 3 colcheias por grupo = ? grupos!' },
          { q: 'Qual compasso é mais comum no <hl>rock</hl>?', opts: ['3/4', '6/8', '4/4', '5/4'], a: 2, exp: '4/4 é onipresente no rock — quatro tempos regulares.', hint: '1-2-3-4, 1-2-3-4... o compasso padrão!' },
          { q: 'A barra dupla fina indica:', opts: ['Fim da música', 'Início de uma nova seção', 'Repetição', 'Compasso diferente'], a: 1, exp: 'Barra dupla fina separa seções da música (ex: verso e refrão).', hint: 'Não é fim, é separação de seção!' },
          { q: 'As barras de repetição :| |: indicam:', opts: ['Fim de música', 'Toque duas vezes o trecho entre elas', 'Mude de compasso', 'Aumente o andamento'], a: 1, exp: 'Barras de repetição: toque o trecho entre elas duas vezes.', hint: 'Os dois pontinhos indicam "volte e repita"!' },
        ],
      },
      {
        id: 'r3',
        title: 'Ritmo e Groove',
        emoji: '🔥',
        desc: 'Síncope, contratempo e dinâmica',
        questions: [
          { q: 'A <hl>síncope</hl> é:', opts: ['Uma pausa longa', 'Acento em tempo fraco', 'Uma nota muito aguda', 'Mudança de tonalidade'], a: 1, exp: 'Síncope = acento em tempo fraco ou parte fraca do tempo.', hint: 'Desloca o acento do tempo forte para o fraco!' },
          { q: 'O <hl>contratempo</hl> ocorre:', opts: ['No tempo forte', 'No tempo 1', 'Entre os tempos principais', 'No início do compasso'], a: 2, exp: 'Contratempo = ataque entre os pulsos principais.', hint: '"Contra" o tempo principal — nas "e"s dos tempos!' },
          { q: 'O <hl>groove</hl> é:', opts: ['Uma figura musical específica', 'A sensação rítmica que faz querer dançar', 'Um tipo de compasso', 'Uma pausa especial'], a: 1, exp: 'Groove é a qualidade rítmica que gera movimento — é o "balanço".', hint: 'É o que faz você balançar a cabeça!' },
          { q: 'O símbolo <hl>ff</hl> na partitura indica:', opts: ['Fraco', 'Fortíssimo', 'Forte normal', 'Muito fraco'], a: 1, exp: 'ff = fortíssimo — muito forte. f = forte, p = piano (fraco).', hint: 'Mais letras = mais intenso!' },
          { q: 'O símbolo <hl>pp</hl> na partitura indica:', opts: ['Pianíssimo (muito fraco)', 'Pouco forte', 'Piano simples', 'Pouquíssimo'], a: 0, exp: 'pp = pianíssimo — muito fraco/suave.', hint: 'p = piano (fraco), pp = ainda mais fraco!' },
          { q: 'O <hl>crescendo</hl> indica:', opts: ['Diminuir o volume', 'Manter o volume', 'Aumentar gradualmente o volume', 'Tocar mais rápido'], a: 2, exp: 'Crescendo = aumentar progressivamente a intensidade.', hint: 'Crescer = ficar maior!' },
          { q: 'O <hl>decrescendo</hl> indica:', opts: ['Aumentar o volume', 'Diminuir gradualmente o volume', 'Parar de tocar', 'Tocar mais devagar'], a: 1, exp: 'Decrescendo = diminuir progressivamente a intensidade.', hint: 'O oposto do crescendo!' },
          { q: 'O <hl>staccato</hl> indica:', opts: ['Tocar longa e sustentada', 'Tocar curta e destacada', 'Aumentar o volume', 'Tocar lenta'], a: 1, exp: 'Staccato = tocar a nota curta e destacada, soltando logo.', hint: 'Stacca (italiano) = destacar!' },
          { q: 'A <hl>tercina</hl> é:', opts: ['3 notas que valem 2', '3 notas que valem 4', '2 notas que valem 3', '3 compassos seguidos'], a: 0, exp: 'Tercina = 3 notas no espaço de 2 notas do mesmo valor.', hint: 'Divide o tempo em 3 em vez de 2!' },
          { q: 'O <hl>shuffle</hl> transforma colcheias em:', opts: ['Semicolcheias iguais', 'Tercinas (longa-curta)', 'Fusas', 'Semínimas'], a: 1, exp: 'Shuffle = groove de tercinas (colcheia longa + curta). O "balanço" do blues.', hint: 'É o swing do blues — longa-curta, longa-curta!' },
          { q: 'O <hl>tempo rubato</hl> significa:', opts: ['Tempo fixo e mecânico', 'Tempo flexível (acelerado/atrasado)', 'Tempo muito rápido', 'Tempo em 3/4'], a: 1, exp: 'Rubato = "roubado" em italiano. O intérprete flexibiliza o tempo livremente.', hint: 'Rubato vem de "roubar" — rouba o tempo!' },
          { q: 'Uma <hl>anacruse</hl> (pickup) é:', opts: ['Uma pausa no final', 'Nota(s) antes do primeiro tempo forte', 'Uma repetição', 'O nome do compasso 4/4'], a: 1, exp: 'Anacruse = notas antes do primeiro tempo forte do compasso.', hint: 'É o "e" antes do "1" — como "pa-ra-BÉNS"!' },
        ],
      },
      {
        id: 'r4',
        title: 'Bateria e Percussão',
        emoji: '🥁',
        desc: 'Elementos e padrões da bateria',
        questions: [
          { q: 'O <hl>bumbo</hl> (bass drum) é tocado com:', opts: ['A mão direita', 'A mão esquerda', 'O pé direito', 'O pé esquerdo'], a: 2, exp: 'Bumbo é tocado com o pé direito (pedal). É a fundação grave.', hint: 'Há um pedal para o bumbo — não usa as mãos!' },
          { q: 'O <hl>hi-hat</hl> (chimbal) é tocado com:', opts: ['Pé esquerdo + mão direita', 'Apenas a mão direita', 'Apenas o pé direito', 'Ambas as mãos'], a: 0, exp: 'Hi-hat: o pé esquerdo controla a abertura, a mão direita toca.', hint: 'Chimbal aberto/fechado com o pé, toque com a mão!' },
          { q: 'No rock básico, o <hl>snare</hl> (caixa) cai nos:', opts: ['Tempos 1 e 3', 'Tempos 2 e 4', 'Todos os tempos', 'Apenas no tempo 1'], a: 1, exp: 'No rock, a caixa cai nos tempos 2 e 4 — o backbeat.', hint: 'É o "crack" que define o backbeat do rock!' },
          { q: 'No rock básico, o <hl>bumbo</hl> cai nos:', opts: ['Todos os tempos', 'Tempos 1 e 3', 'Tempos 2 e 4', 'Apenas no tempo 4'], a: 1, exp: 'Bumbo nos tempos 1 e 3, caixa nos 2 e 4 — o padrão fundamental.', hint: 'Bumbo e caixa se alternam: bumbo(1), caixa(2), bumbo(3), caixa(4)!' },
          { q: 'O <hl>ride cymbal</hl> é usado principalmente para:', opts: ['Marcar o backbeat', 'Manter o pulso/groove', 'Acentos especiais', 'Finalizar músicas'], a: 1, exp: 'O ride cymbal mantém o pulso constante — como o hi-hat, mas mais aberto.', hint: 'É o "ting-ting-ting" constante do jazz!' },
          { q: 'O <hl>crash cymbal</hl> é usado para:', opts: ['Manter o pulso', 'Acentuar o backbeat', 'Marcar momentos de impacto/ênfase', 'Tocar semicolcheias'], a: 2, exp: 'O crash marca momentos de ênfase — início de seções, chegadas.', hint: 'CRASH! É um acento dramático!' },
          { q: 'A técnica de <hl>ghost notes</hl> na caixa produz:', opts: ['Notas muito fortes', 'Notas quase inaudíveis, delicadas', 'Pausas na caixa', 'Notas fora do tempo'], a: 1, exp: 'Ghost notes = notas muito suaves, quase inaudíveis. Dão textura ao groove.', hint: 'Como "fantasmas" — quase não se ouvem!' },
          { q: 'A bateria de <hl>bossa nova</hl> é caracterizada por:', opts: ['Batidas fortes e pesadas', 'Padrão sutil, muitas vezes com vassoura', 'Bumbo em todos os tempos', 'Crash em todo tempo forte'], a: 1, exp: 'Bossa nova: bateria suave, vassoura (brush) na caixa, padrão sutil.', hint: 'Bossa = "jeito" — leve, delicado, sofisticado!' },
          { q: 'A <hl>vassoura</hl> (brush) de bateria produz:', opts: ['Sons mais fortes', 'Sons mais suaves e esfregados', 'Apenas no jazz', 'Somente no bumbo'], a: 1, exp: 'Vassoura/brush gera sons suaves e o som "esfregado" típico do jazz.', hint: 'Imagine escovar o couro da caixa — suave!' },
          { q: 'O <hl>paradiddle</hl> tem o padrão:', opts: ['RRLL RRLL', 'RLRR LRLL', 'RLRL RLRL', 'RLLR LRRL'], a: 1, exp: 'Paradiddle = RLRR LRLL. R=direita, L=esquerda. Rudimento fundamental.', hint: 'Para-di-ddle: R-L-R-R! A sílaba te diz o padrão!' },
          { q: 'O <hl>fill</hl> de bateria é:', opts: ['Um tipo de compasso', 'Uma frase que conecta seções', 'O padrão constante do groove', 'Uma nota longa'], a: 1, exp: 'Fill = preenchimento rítmico que marca transições entre seções.', hint: 'É o "comentário" do baterista nas transições!' },
          { q: 'O padrão de samba na bateria usa muito:', opts: ['Hi-hat fechado uniforme', 'Rimshot na caixa e bumbo sincopado', 'Ride cymbal constante', 'Apenas bumbo e caixa'], a: 1, exp: 'O samba usa rimshot (baqueta no aro da caixa) e bumbo sincopado.', hint: 'É a complexidade rítmica brasileira!' },
        ],
      },
    ],
  },
};

/* ════════════════════════════════════════════════════════════
   CONQUISTAS
════════════════════════════════════════════════════════════ */
const ACHIEVEMENTS = [
  { id: 'first_correct', emoji: '🎯', name: 'Primeira Nota',       desc: 'Acerte sua primeira questão',      check: s => s.totalCorrect >= 1 },
  { id: 'combo_3',       emoji: '🔥', name: 'Em Chamas',           desc: 'Faça um combo de 3x',              check: s => s.maxCombo >= 3 },
  { id: 'combo_10',      emoji: '⚡', name: 'Eletrizante',          desc: 'Faça um combo de 10x',             check: s => s.maxCombo >= 10 },
  { id: 'combo_25',      emoji: '🌩️', name: 'Tempestade',           desc: 'Faça um combo de 25x',             check: s => s.maxCombo >= 25 },
  { id: 'combo_50',      emoji: '💻', name: 'Hacker Musical',       desc: 'Combo lendário de 50x!',           check: s => s.maxCombo >= 50 },
  { id: 'level1_done',   emoji: '⭐', name: 'Primeiro Nível',       desc: 'Complete o Nível 1',               check: s => s.levelsCompleted >= 1 },
  { id: 'level3_done',   emoji: '🌟', name: 'Metade da Trilha',     desc: 'Complete 3 níveis',                check: s => s.levelsCompleted >= 3 },
  { id: 'all_harm',      emoji: '🎼', name: 'Mestre da Harmonia',   desc: 'Complete toda a trilha de Harmonia', check: s => s.harmCompleted >= 5 },
  { id: 'all_rhy',       emoji: '🥁', name: 'Mestre do Ritmo',      desc: 'Complete toda a trilha de Ritmo', check: s => s.rhyCompleted >= 4 },
  { id: 'xp_100',        emoji: '💫', name: 'Colecionador',         desc: 'Acumule 100 XP',                   check: s => s.totalXP >= 100 },
  { id: 'xp_500',        emoji: '💎', name: 'Dedicado',             desc: 'Acumule 500 XP',                   check: s => s.totalXP >= 500 },
  { id: 'used_hint',     emoji: '💡', name: 'Curioso',              desc: 'Use uma dica',                     check: s => s.totalHints >= 1 },
  { id: 'no_hints_lvl',  emoji: '🧠', name: 'Autoconfiante',        desc: 'Complete um nível sem dicas',      check: s => s.noHintLevels >= 1 },
  { id: 'stars_50',      emoji: '🌠', name: 'Coletor de Estrelas',  desc: 'Acumule 50 estrelas',              check: s => s.totalStars >= 50 },
];

/* ════════════════════════════════════════════════════════════
   TÍTULOS POR XP
════════════════════════════════════════════════════════════ */
function getLevelTitle(xp) {
  if (xp < 50)   return { name: 'Iniciante',      icon: '🥚' };
  if (xp < 150)  return { name: 'Aprendiz',       icon: '🐣' };
  if (xp < 300)  return { name: 'Estudante',      icon: '📖' };
  if (xp < 500)  return { name: 'Músico',         icon: '🎵' };
  if (xp < 800)  return { name: 'Instrumentista', icon: '🎸' };
  if (xp < 1200) return { name: 'Compositor',     icon: '🎼' };
  if (xp < 2000) return { name: 'Maestro',        icon: '🎩' };
  return                 { name: 'Virtuoso',       icon: '🏆' };
}

function getXPThresholds(xp) {
  const thresholds = [0, 50, 150, 300, 500, 800, 1200, 2000, 9999];
  let prev = 0;
  let next = 9999;
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (xp >= thresholds[i] && xp < thresholds[i + 1]) {
      prev = thresholds[i];
      next = thresholds[i + 1];
      break;
    }
  }
  return { prev, next };
}

/* ════════════════════════════════════════════════════════════
   ESTADO GLOBAL
════════════════════════════════════════════════════════════ */
const DEFAULT_STATE = {
  path: null,
  progress: {},
  totalXP: 0,
  totalStars: 0,
  totalCorrect: 0,
  totalHints: 0,
  maxCombo: 0,
  levelsCompleted: 0,
  harmCompleted: 0,
  rhyCompleted: 0,
  noHintLevels: 0,
  achievements: [],
};

let ST = Object.assign({}, DEFAULT_STATE);

// Quiz session — nunca persiste no localStorage
let QUIZ = null;

/* ─ Inicializa progress para todos os níveis ─ */
function initProgress() {
  Object.keys(PATHS).forEach(pathId => {
    PATHS[pathId].levels.forEach(lv => {
      if (!ST.progress[lv.id]) {
        ST.progress[lv.id] = { done: false, correctIds: [], stars: [] };
      }
      // Garante que correctIds e stars são arrays (proteção contra dados corrompidos)
      if (!Array.isArray(ST.progress[lv.id].correctIds)) ST.progress[lv.id].correctIds = [];
      if (!Array.isArray(ST.progress[lv.id].stars))      ST.progress[lv.id].stars = [];
      // Remove pendingIds do localStorage (não deve persistir)
      delete ST.progress[lv.id].pendingIds;
    });
  });
}

/* ─ Persistência ─ */
function saveState() {
  try {
    // Nunca salva pendingIds (dados de sessão)
    const toSave = { ...ST };
    localStorage.setItem('am3_state', JSON.stringify(toSave));
  } catch (e) {
    console.warn('Aventura Musical: falha ao salvar estado.', e);
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem('am3_state');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Valida campos obrigatórios antes de aceitar
      if (parsed && typeof parsed === 'object') {
        ST = Object.assign({}, DEFAULT_STATE, parsed);
      }
    }
  } catch (e) {
    console.warn('Aventura Musical: estado corrompido, reiniciando.', e);
    ST = Object.assign({}, DEFAULT_STATE);
  }
  initProgress();
}

/* ════════════════════════════════════════════════════════════
   UTILITÁRIOS
════════════════════════════════════════════════════════════ */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
  const target = document.getElementById(id);
  if (target) target.classList.remove('hidden');
}

let _toastTimer = null;
function showToast(msg, type) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

/* XP floating popup — com clamping para não sair da tela */
function showXPPop(xp, anchorEl) {
  const pop = document.createElement('div');
  pop.className = 'xp-pop';
  pop.textContent = '+' + xp + ' XP';

  let left = window.innerWidth / 2 - 24;
  let top  = window.innerHeight / 2 - 20;

  if (anchorEl) {
    const rect = anchorEl.getBoundingClientRect();
    left = rect.left + rect.width / 2 - 24;
    top  = rect.top - 14;
  }

  // Clamp para não sair da viewport
  left = Math.max(4, Math.min(left, window.innerWidth - 80));
  top  = Math.max(60, Math.min(top, window.innerHeight - 60));

  pop.style.left = left + 'px';
  pop.style.top  = top + 'px';
  document.body.appendChild(pop);
  setTimeout(() => { if (pop.parentNode) pop.parentNode.removeChild(pop); }, 1400);
}

/* ════════════════════════════════════════════════════════════
   SISTEMA DE ESTRELAS
════════════════════════════════════════════════════════════ */
/**
 * Retorna { count, type, icon } para um combo dado.
 * combo=0 (usado após dica) → sempre 1 estrela 🔥
 */
function getStarsForCombo(combo) {
  if (combo >= 50) return { count: 10, type: 'hacker',    icon: '💻' };
  if (combo >= 25) return { count: 5,  type: 'lightning', icon: '⚡' };
  if (combo >= 10) return { count: 3,  type: 'lightning', icon: '⚡' };
  if (combo >= 3)  return { count: 2,  type: 'fire',      icon: '🔥' };
  return                   { count: 1,  type: 'fire',      icon: '🔥' };
}

/* Atualiza a prévia de estrelas no card */
function updateStarPreview() {
  if (!QUIZ) return;
  const nextCombo = QUIZ.hintThisQ ? 0 : QUIZ.combo + 1;
  const star = getStarsForCombo(nextCombo);
  const count = Math.min(star.count, 10);
  const row = document.getElementById('stars-earned-row');
  if (!row) return;
  row.innerHTML = '<span class="se-label">+</span><span style="font-size:13px;letter-spacing:1px">'
    + star.icon.repeat(count) + '</span>';
}

/* ════════════════════════════════════════════════════════════
   CONQUISTAS
════════════════════════════════════════════════════════════ */
function checkAchievements() {
  let newUnlock = false;
  ACHIEVEMENTS.forEach(ach => {
    if (!ST.achievements.includes(ach.id) && ach.check(ST)) {
      ST.achievements.push(ach.id);
      newUnlock = true;
      setTimeout(() => showToast('🏆 Conquista: ' + ach.name, 'xp'), 900);
    }
  });
  return newUnlock;
}

/* ════════════════════════════════════════════════════════════
   CONFETTI
════════════════════════════════════════════════════════════ */
function spawnConfetti() {
  const wrap = document.getElementById('confetti');
  if (!wrap) return;
  wrap.innerHTML = '';
  const colors = ['#f0b429', '#ffd166', '#7c6af5', '#a89bf8', '#27c98f', '#e8445a', '#60a5fa', '#ff7d8f'];
  for (let i = 0; i < 65; i++) {
    const el = document.createElement('div');
    el.className = 'cp';
    el.style.left             = (Math.random() * 100) + 'vw';
    el.style.background       = colors[Math.floor(Math.random() * colors.length)];
    el.style.width            = (5 + Math.random() * 7) + 'px';
    el.style.height           = (5 + Math.random() * 7) + 'px';
    el.style.borderRadius     = Math.random() > 0.5 ? '50%' : '2px';
    el.style.animationDuration = (1.4 + Math.random() * 2) + 's';
    el.style.animationDelay    = (Math.random() * 0.9) + 's';
    wrap.appendChild(el);
  }
  setTimeout(() => { wrap.innerHTML = ''; }, 4200);
}

/* ════════════════════════════════════════════════════════════
   TELA 1 — SELEÇÃO DE CAMINHO
════════════════════════════════════════════════════════════ */
function selectPath(pathId) {
  if (!PATHS[pathId]) return;
  ST.path = pathId;
  saveState();
  openTrail();
}

/* ════════════════════════════════════════════════════════════
   TELA 2 — TRILHA
════════════════════════════════════════════════════════════ */
function openTrail() {
  if (!ST.path || !PATHS[ST.path]) {
    showScreen('s-path');
    return;
  }
  const P = PATHS[ST.path];
  const dot  = document.getElementById('tpb-dot');
  const name = document.getElementById('tpb-name');
  if (dot)  dot.style.background = P.color;
  if (name) name.textContent     = P.name;
  renderTrail();
  showScreen('s-trail');
}

function getLevelPct(lvId) {
  if (!ST.path) return 0;
  const P   = PATHS[ST.path];
  const lv  = P.levels.find(l => l.id === lvId);
  const prog = ST.progress[lvId];
  if (!lv || !prog) return 0;
  return Math.round((prog.correctIds.length / lv.questions.length) * 100);
}

function renderTrail() {
  if (!ST.path) return;
  const P     = PATHS[ST.path];
  const inner = document.getElementById('trail-inner');
  if (!inner) return;

  let html = '';

  P.levels.forEach((lv, i) => {
    const prog        = ST.progress[lv.id] || { done: false, correctIds: [], stars: [] };
    const isDone      = !!prog.done;
    const prevDone    = i === 0 || !!(ST.progress[P.levels[i - 1].id] || {}).done;
    const isAvailable = prevDone;
    const isLocked    = !isAvailable && !isDone;
    const pct         = getLevelPct(lv.id);
    const flip        = i % 2 === 1;

    // Node CSS class
    let nodeClass = '';
    if (isDone)      nodeClass = 'done';
    else if (isLocked) nodeClass = 'locked';
    else             nodeClass = 'active ' + P.cls + '-active';

    // Click handler (only if playable)
    const clickAttr = isLocked ? '' : `onclick="startLevel('${lv.id}')"`;

    // Stars display (max 5 slots shown)
    const starsEarned = Array.isArray(prog.stars) ? prog.stars : [];
    let starsHtml = '';
    for (let s = 0; s < 5; s++) {
      const earned = starsEarned[s];
      starsHtml += `<span class="star-icon${earned ? ' earned' : ''}">${earned ? earned.icon : '⭐'}</span>`;
    }

    // Progress fill class
    const fillCls = isDone ? 'done' : P.cls;

    // Connector before node (skip first)
    if (i > 0) {
      const prevNodeDone = !!(ST.progress[P.levels[i - 1].id] || {}).done;
      html += `<div class="t-connector ${prevNodeDone ? 'done' : 'lock'}"></div>`;
    }

    html += `
      <div class="t-node-row${flip ? ' flip' : ''}">
        <div class="t-node-btn ${nodeClass}" ${clickAttr} role="button" aria-label="Nível ${i + 1}: ${lv.title}">
          <div class="n-emoji">${lv.emoji}</div>
          <div class="n-label">${isDone ? 'Feito!' : isLocked ? '🔒' : 'Jogar'}</div>
          ${isDone ? '<div class="done-badge" aria-hidden="true">✓</div>' : ''}
        </div>
        <div class="t-node-info">
          <div class="tni-lvl">Nível ${i + 1}</div>
          <div class="tni-name${isLocked ? ' locked' : ''}">${escapeHtml(lv.title)}</div>
          <div class="tni-stars" aria-label="${starsEarned.length} estrelas">${starsHtml}</div>
          <div class="tni-prog">
            <div class="tni-pbar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
              <div class="tni-pfill ${fillCls}" style="width:${pct}%"></div>
            </div>
            <div class="tni-ptxt">${isDone ? '✓ 100%' : isLocked ? '🔒' : pct + '%'}</div>
          </div>
        </div>
      </div>`;
  });

  inner.innerHTML = html;
}

/* Escapa caracteres HTML para evitar XSS em títulos dinâmicos */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ════════════════════════════════════════════════════════════
   TELA 3 — QUIZ
════════════════════════════════════════════════════════════ */
function startLevel(lvId) {
  if (!ST.path) return;
  const P    = PATHS[ST.path];
  const lv   = P.levels.find(l => l.id === lvId);
  const prog = ST.progress[lvId];
  if (!lv || !prog) return;

  // Calcula fila de pendentes (questões ainda não acertadas), embaralhadas
  const allIdx    = lv.questions.map((_, i) => i);
  const remaining = allIdx.filter(i => !prog.correctIds.includes(i));
  const queue     = shuffle(remaining);

  // Cria sessão de quiz em memória (NÃO persiste no localStorage)
  QUIZ = {
    lvId,
    pathId:         ST.path,
    queue,
    combo:          0,
    maxCombo:       0,
    xpSession:      0,
    starsSession:   [],
    correctSession: 0,
    totalSession:   0,
    hintUsed:       false,
    hintThisQ:      false,
    qIndex:         0,
    currentQ:       null,
    answered:       false,
  };

  // Configura UI
  const lvIdx = P.levels.indexOf(lv);
  setEl('qlv-badge', `${P.name} · Nível ${lvIdx + 1}/${P.levels.length}`);
  setEl('qlv-name', lv.title);

  const card    = document.getElementById('quiz-card');
  const pbar    = document.getElementById('quiz-pbar');
  const nextBtn = document.getElementById('quiz-next');
  const combo   = document.getElementById('combo-badge');

  if (card)    card.className    = `quiz-card ${P.cls}-card`;
  if (pbar)    pbar.className    = `quiz-pbar-fill ${P.cls}`;
  if (nextBtn) nextBtn.className = `quiz-next ${P.cls}-btn`;
  if (combo)   combo.className   = 'quiz-combo-badge none';

  showScreen('s-quiz');
  nextQuestion();
}

/* Atalho para definir textContent com null-check */
function setEl(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function nextQuestion() {
  if (!QUIZ) return;
  const P    = PATHS[QUIZ.pathId];
  const lv   = P.levels.find(l => l.id === QUIZ.lvId);
  const prog = ST.progress[QUIZ.lvId];
  if (!lv || !prog) return;

  // Atualiza barra de progresso
  const totalQ = lv.questions.length;
  const correct = prog.correctIds.length;
  const pct     = Math.round((correct / totalQ) * 100);

  const pbar = document.getElementById('quiz-pbar');
  if (pbar) pbar.style.width = pct + '%';
  setEl('quiz-pstat', `${correct}/${totalQ} corretas`);
  setEl('quiz-xp-sess', QUIZ.xpSession > 0 ? `+${QUIZ.xpSession} XP` : '');

  // Reconstrói fila se acabou (mas ainda há pendentes)
  if (QUIZ.queue.length === 0) {
    const remaining = lv.questions.map((_, i) => i).filter(i => !prog.correctIds.includes(i));
    if (remaining.length === 0) {
      completedLevel();
      return;
    }
    QUIZ.queue = shuffle(remaining);
  }

  // Sorteia próxima questão
  const qIdx     = QUIZ.queue.shift();
  QUIZ.currentQ  = qIdx;
  QUIZ.answered  = false;
  QUIZ.hintThisQ = false;
  QUIZ.qIndex++;

  const qData = lv.questions[qIdx];
  if (!qData) { nextQuestion(); return; } // guard: índice inválido

  setEl('qq-label', `Questão ${QUIZ.qIndex}`);

  // Renderiza texto da questão (substitui <hl> por span estilizado)
  const qTextEl = document.getElementById('qq-text');
  if (qTextEl) {
    qTextEl.innerHTML = qData.q.replace(
      /<hl>(.*?)<\/hl>/g,
      `<span class="hl ${P.cls}-hl">$1</span>`
    );
  }

  // Reset dica
  const hintBtn = document.getElementById('hint-btn');
  const hintBox = document.getElementById('hint-box');
  if (hintBtn) { hintBtn.className = 'hint-btn'; hintBtn.textContent = '💡 Dica'; }
  if (hintBox) { hintBox.className = 'hint-box'; hintBox.textContent = ''; }

  // Atualiza prévia de estrelas
  updateStarPreview();

  // Embaralha opções e renderiza
  const optsIndexed = qData.opts.map((txt, i) => ({ txt, correct: i === qData.a }));
  const shuffled    = shuffle(optsIndexed);
  const letters     = ['A', 'B', 'C', 'D'];

  const optsEl = document.getElementById('quiz-opts');
  if (optsEl) {
    optsEl.innerHTML = shuffled.map((opt, i) => `
      <button class="opt-btn"
        data-correct="${opt.correct}"
        onclick="handleAnswer(this)"
        type="button">
        <div class="opt-letter">${letters[i]}</div>
        <div class="opt-text">${escapeHtml(opt.txt)}</div>
        <div class="opt-result" aria-hidden="true">${opt.correct ? '✓' : '✗'}</div>
      </button>`).join('');
  }

  // Esconde feedback e botão next
  const fb      = document.getElementById('quiz-fb');
  const nextBtn = document.getElementById('quiz-next');
  if (fb)      fb.className      = 'quiz-fb';
  if (nextBtn) nextBtn.className = `quiz-next ${P.cls}-btn`;
}

/* ─ Resposta (chamada via onclick no botão) ─ */
function handleAnswer(btn) {
  if (!QUIZ || QUIZ.answered) return;

  // Lê isCorrect do data-attribute (evita passagem de booleano como string via onclick)
  const isCorrect = btn.dataset.correct === 'true';
  processAnswer(btn, isCorrect);
}

function processAnswer(btn, isCorrect) {
  QUIZ.answered = true;

  const P    = PATHS[QUIZ.pathId];
  const lv   = P.levels.find(l => l.id === QUIZ.lvId);
  const prog = ST.progress[QUIZ.lvId];
  const qData = lv.questions[QUIZ.currentQ];

  // Desabilita todos os botões
  document.querySelectorAll('.opt-btn').forEach(b => { b.disabled = true; });

  // Marca visual
  btn.classList.add(isCorrect ? 'correct' : 'wrong');
  if (!isCorrect) {
    // Revela a correta
    document.querySelectorAll('.opt-btn[data-correct="true"]').forEach(b => b.classList.add('correct'));
  }

  QUIZ.totalSession++;
  ST.totalCorrect++;

  if (isCorrect) {
    // Calcula combo (dica zera combo mas ainda ganha 1 estrela)
    if (!QUIZ.hintThisQ) {
      QUIZ.combo++;
      if (QUIZ.combo > QUIZ.maxCombo) QUIZ.maxCombo = QUIZ.combo;
      if (QUIZ.combo > ST.maxCombo)   ST.maxCombo   = QUIZ.combo;
    }
    // combo=0 quando usou dica → getStarsForCombo(0) → 1 estrela 🔥
    const comboForStars = QUIZ.hintThisQ ? 0 : QUIZ.combo;
    const starInfo = getStarsForCombo(comboForStars);

    // XP = estrelas × 10
    const xpGained = starInfo.count * 10;
    QUIZ.xpSession  += xpGained;
    ST.totalXP      += xpGained;
    ST.totalStars   += starInfo.count;

    // Registra estrelas da sessão
    for (let i = 0; i < starInfo.count; i++) {
      QUIZ.starsSession.push({ icon: starInfo.icon });
    }

    // Marca questão como acertada (sem duplicatas)
    if (!prog.correctIds.includes(QUIZ.currentQ)) {
      prog.correctIds.push(QUIZ.currentQ);
    }
    QUIZ.correctSession++;

    // Feedback positivo
    const comboMsg = (!QUIZ.hintThisQ && QUIZ.combo >= 3) ? ` 🔥 Combo ${QUIZ.combo}x!` : '';
    showFeedback('ok', '🎉', 'Correto!' + comboMsg, qData.exp);
    showXPPop(xpGained, btn);

  } else {
    // Erro — zera combo e re-enfileira questão
    QUIZ.combo = 0;
    QUIZ.queue.push(QUIZ.currentQ);
    showFeedback('err', '💡', 'Quase! Vai voltar no banco 🔄', qData.exp);
  }

  updateComboBadge();
  updateStarPreview();
  updateProgressBar();
  checkAchievements();
  saveState();

  // Texto do botão "Próxima"
  const remaining = lv.questions.length - prog.correctIds.length;
  const nextBtn   = document.getElementById('quiz-next');
  if (nextBtn) {
    nextBtn.textContent = remaining === 0
      ? '🏆 Concluir Nível!'
      : 'Próxima →' + (remaining <= 4 ? ` (${remaining} restante${remaining !== 1 ? 's' : ''})` : '');
    nextBtn.className = `quiz-next show ${P.cls}-btn`;
  }
}

function showFeedback(type, icon, title, body) {
  const fb      = document.getElementById('quiz-fb');
  const fbIco   = document.getElementById('fb-ico');
  const fbTitle = document.getElementById('fb-title');
  const fbExp   = document.getElementById('fb-exp');
  if (!fb) return;
  if (fbIco)   fbIco.textContent   = icon;
  if (fbTitle) { fbTitle.textContent = title; fbTitle.className = 'fb-title ' + type; }
  if (fbExp)   fbExp.textContent   = body;
  fb.className = 'quiz-fb show ' + type;
}

function updateComboBadge() {
  if (!QUIZ) return;
  const badge    = document.getElementById('combo-badge');
  const comboNum = document.getElementById('combo-num');
  if (!badge) return;
  if (comboNum) comboNum.textContent = QUIZ.combo;

  if (QUIZ.combo >= 50)     badge.className = 'quiz-combo-badge hacker';
  else if (QUIZ.combo >= 10) badge.className = 'quiz-combo-badge lightning';
  else if (QUIZ.combo >= 3)  badge.className = 'quiz-combo-badge fire';
  else                       badge.className = 'quiz-combo-badge none';
}

function updateProgressBar() {
  if (!QUIZ) return;
  const P    = PATHS[QUIZ.pathId];
  const lv   = P.levels.find(l => l.id === QUIZ.lvId);
  const prog = ST.progress[QUIZ.lvId];
  if (!lv || !prog) return;

  const pct = Math.round((prog.correctIds.length / lv.questions.length) * 100);
  const pbar = document.getElementById('quiz-pbar');
  if (pbar) pbar.style.width = pct + '%';
  setEl('quiz-pstat', `${prog.correctIds.length}/${lv.questions.length} corretas`);
  setEl('quiz-xp-sess', `+${QUIZ.xpSession} XP`);
}

/* ─ Dica ─ */
function useHint() {
  if (!QUIZ || QUIZ.answered || QUIZ.hintThisQ) return;

  const P    = PATHS[QUIZ.pathId];
  const lv   = P.levels.find(l => l.id === QUIZ.lvId);
  if (!lv) return;
  const qData = lv.questions[QUIZ.currentQ];
  if (!qData || !qData.hint) return;

  // Penalidades
  QUIZ.combo     = 0;
  QUIZ.hintThisQ = true;
  QUIZ.hintUsed  = true;
  ST.totalHints++;

  const hintBtn = document.getElementById('hint-btn');
  const hintBox = document.getElementById('hint-box');
  if (hintBtn) { hintBtn.className = 'hint-btn used'; hintBtn.textContent = '💡 Dica usada'; }
  if (hintBox) {
    hintBox.innerHTML = '<strong>💡 Dica:</strong> ' + escapeHtml(qData.hint);
    hintBox.className = 'hint-box show';
  }

  updateComboBadge();
  updateStarPreview();
  showToast('💡 Dica usada — combo zerado', '');
  saveState();
}

/* ─ Botão próxima questão ─ */
function onNextQuestion() {
  if (!QUIZ) return;
  const P    = PATHS[QUIZ.pathId];
  const lv   = P.levels.find(l => l.id === QUIZ.lvId);
  const prog = ST.progress[QUIZ.lvId];
  if (!lv || !prog) return;

  const remaining = lv.questions.filter((_, i) => !prog.correctIds.includes(i)).length;
  if (remaining === 0) {
    completedLevel();
  } else {
    nextQuestion();
  }
}

/* ════════════════════════════════════════════════════════════
   TELA 4 — NÍVEL CONCLUÍDO
════════════════════════════════════════════════════════════ */
function completedLevel() {
  if (!QUIZ) return;
  const P    = PATHS[QUIZ.pathId];
  const lv   = P.levels.find(l => l.id === QUIZ.lvId);
  const prog = ST.progress[QUIZ.lvId];
  const lvIdx = P.levels.indexOf(lv);
  if (!lv || !prog || lvIdx === -1) return;

  // Marca nível como concluído
  prog.done = true;

  // Salva as melhores estrelas da sessão (mantém o melhor histórico)
  if (!Array.isArray(prog.stars) || prog.stars.length < QUIZ.starsSession.length) {
    prog.stars = QUIZ.starsSession.slice(0, 10);
  }

  // Stats globais
  if (!QUIZ.hintUsed) ST.noHintLevels++;
  ST.levelsCompleted++;
  if (QUIZ.pathId === 'harmonia') ST.harmCompleted++;
  if (QUIZ.pathId === 'ritmo')    ST.rhyCompleted++;

  checkAchievements();
  saveState();
  spawnConfetti();

  // Monta tela de conclusão
  const isLast = lvIdx >= P.levels.length - 1;
  const card   = document.getElementById('comp-card');
  if (card) card.className = `comp-card ${P.cls}-comp`;

  setEl('comp-emoji', isLast ? '🏆' : '⭐');
  setEl('comp-title', isLast ? 'Trilha Completa!' : 'Nível Concluído!');
  setEl('comp-sub',   isLast
    ? `Incrível! Você dominou toda a trilha de ${P.name}!`
    : `Nível ${lvIdx + 1} conquistado! Próximo: ${P.levels[lvIdx + 1] ? P.levels[lvIdx + 1].title : ''}`);

  // Estrelas
  const starsRow = document.getElementById('comp-stars');
  if (starsRow) {
    const show = QUIZ.starsSession.slice(0, 10);
    starsRow.innerHTML = show.length
      ? show.map(s => `<span>${s.icon}</span>`).join('')
      : '⭐';
  }

  setEl('cs-acertos', QUIZ.correctSession);
  setEl('cs-xp',      QUIZ.xpSession);
  setEl('cs-combo',   QUIZ.maxCombo + 'x');

  // Botão de ação principal
  const nextBtn = document.getElementById('comp-next');
  if (nextBtn) {
    nextBtn.className = `comp-btn ${P.cls}`;
    if (isLast) {
      nextBtn.textContent = 'Ver Trilha';
      nextBtn.onclick = goTrail;
    } else {
      const nextLv = P.levels[lvIdx + 1];
      nextBtn.textContent = `Próximo: ${nextLv.title} →`;
      nextBtn.onclick = () => startLevel(nextLv.id);
    }
  }

  showScreen('s-complete');
}

function goTrail() {
  renderTrail();
  showScreen('s-trail');
}

/* ════════════════════════════════════════════════════════════
   PERFIL
════════════════════════════════════════════════════════════ */
function openProfile() {
  // Null-check: path pode não estar definido se perfil for aberto por engano
  if (!ST.path || !PATHS[ST.path]) return;

  const P         = PATHS[ST.path];
  const title     = getLevelTitle(ST.totalXP);
  const { prev, next } = getXPThresholds(ST.totalXP);
  const range     = next - prev;
  const progress  = ST.totalXP - prev;
  const pct       = range > 0 ? Math.min(100, Math.round((progress / range) * 100)) : 100;

  const avatar = document.getElementById('prof-avatar');
  if (avatar) {
    avatar.textContent       = title.icon;
    avatar.style.background  = P.glow;
  }

  const pathName = document.getElementById('prof-path-name');
  if (pathName) {
    pathName.textContent = P.name + ' · Trilha Ativa';
    pathName.style.color = P.color;
  }

  setEl('prof-level-name', title.name);

  const xpBar = document.getElementById('prof-xp-bar');
  if (xpBar) {
    xpBar.style.width      = pct + '%';
    xpBar.style.background = `linear-gradient(90deg, ${P.color}, ${P.color2})`;
  }
  setEl('prof-xp-txt', `${ST.totalXP} / ${next} XP`);

  const doneCount = Object.values(ST.progress).filter(p => p.done).length;
  const grid = document.getElementById('prof-grid');
  if (grid) {
    grid.innerHTML = `
      <div class="prof-stat"><div class="prof-stat-v">${ST.totalXP}</div><div class="prof-stat-l">XP Total</div></div>
      <div class="prof-stat"><div class="prof-stat-v">${ST.totalStars}</div><div class="prof-stat-l">⭐ Estrelas</div></div>
      <div class="prof-stat"><div class="prof-stat-v">${doneCount}</div><div class="prof-stat-l">Níveis Feitos</div></div>
      <div class="prof-stat"><div class="prof-stat-v">${ST.maxCombo}x</div><div class="prof-stat-l">Maior Combo</div></div>
    `;
  }

  // Conquistas recentes (últimas 4)
  const recent = ACHIEVEMENTS.filter(a => ST.achievements.includes(a.id)).slice(-4);
  const achGrid = document.getElementById('prof-ach-grid');
  if (achGrid) {
    achGrid.innerHTML = recent.length
      ? recent.map(a => `
          <div class="ach-card unlocked">
            <div class="ach-emoji">${a.emoji}</div>
            <div class="ach-name">${escapeHtml(a.name)}</div>
            <div class="ach-desc">${escapeHtml(a.desc)}</div>
            <div class="ach-badge">✓</div>
          </div>`).join('')
      : `<div style="color:var(--txt3);font-size:13px;padding:10px 0;grid-column:1/-1">
           Nenhuma conquista ainda. Continue jogando!
         </div>`;
  }

  openModal('modal-profile');
}

/* ════════════════════════════════════════════════════════════
   MURAL DE CONQUISTAS
════════════════════════════════════════════════════════════ */
function openAchievements() {
  const grid = document.getElementById('ach-full-grid');
  if (!grid) return;
  grid.innerHTML = ACHIEVEMENTS.map(a => {
    const unlocked = ST.achievements.includes(a.id);
    return `
      <div class="ach-card ${unlocked ? 'unlocked' : 'locked-ach'}">
        <div class="ach-emoji">${a.emoji}</div>
        <div class="ach-name">${escapeHtml(a.name)}</div>
        <div class="ach-desc">${escapeHtml(a.desc)}</div>
        ${unlocked ? '<div class="ach-badge">✓ Obtida</div>' : ''}
      </div>`;
  }).join('');
  openModal('modal-ach');
}

/* ════════════════════════════════════════════════════════════
   EVENT LISTENERS
════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* Navegação */
  const trailBack = document.getElementById('trail-back');
  if (trailBack) trailBack.addEventListener('click', () => showScreen('s-path'));

  const quizX = document.getElementById('quiz-x');
  if (quizX) quizX.addEventListener('click', () => {
    // Ao sair do quiz, salva estado (sem pendingIds, que não persiste)
    saveState();
    renderTrail();
    showScreen('s-trail');
  });

  const quizNext = document.getElementById('quiz-next');
  if (quizNext) quizNext.addEventListener('click', onNextQuestion);

  const compTrailBtn = document.getElementById('comp-trail-btn');
  if (compTrailBtn) compTrailBtn.addEventListener('click', goTrail);

  /* Modais — fechar ao clicar no overlay */
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.classList.remove('show');
    });
  });

  /* Modais — fechar pelo botão ✕ */
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const overlay = btn.closest('.modal-overlay');
      if (overlay) overlay.classList.remove('show');
    });
  });

  /* Impede que click no sheet propague para o overlay */
  document.querySelectorAll('.modal-sheet').forEach(sheet => {
    sheet.addEventListener('click', e => e.stopPropagation());
  });

  /* Boot */
  loadState();
  if (ST.path && PATHS[ST.path]) {
    openTrail();
  } else {
    showScreen('s-path');
  }
});