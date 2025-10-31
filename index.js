const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');

// ===== FUNÇÕES AUXILIARES =====
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const delayAleatorio = () => Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;

// ===== CRIAÇÃO DO CLIENTE =====
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

// ===== EVENTO QR =====
client.on('qr', (qr) => {
  console.log('📱 Escaneie o QR Code abaixo com o WhatsApp Business:');
  qrcode.generate(qr, { small: true });
});

// ===== EVENTO READY =====
client.on('ready', async () => {
  console.log('🤖 Bot conectado com sucesso!');

  // TESTE DE ENVIO (opcional)
  const meuNumero = '5598981809688@c.us'; // coloque o seu número com DDI + DDD + @c.us
  try {
    await client.sendMessage(meuNumero, '✅ O bot está online e funcionando, meu rei!');
    console.log('✅ Teste de envio inicial bem-sucedido!');
  } catch (err) {
    console.error('❌ Erro ao enviar mensagem de teste:', err.message);
  }
});

// ===== ARMAZENAMENTO DE USUÁRIOS =====
const usuarios = {};

// ===== FUNÇÃO DE ENVIO =====
async function enviarMensagem(destino, texto) {
  const tempo = delayAleatorio();
  console.log(`⏳ Enviando mensagem para ${destino} após ${tempo}ms`);
  await sleep(tempo);
  try {
    await client.sendMessage(destino, texto);
    console.log(`✅ Mensagem enviada para ${destino}: "${texto.substring(0, 40)}..."`);
  } catch (err) {
    console.error(`❌ Erro ao enviar mensagem para ${destino}:`, err.message);
  }
}

// ===== FUNÇÃO PARA ENVIAR PDF =====
async function enviarPDF(numero, tipo) {
  const caminhos = {
    casamento: 'Casamento.pdf',
    kids: 'Kids.pdf',
    teen: 'Teen.pdf'
  };

  const caminhoArquivo = path.join(__dirname, 'pdfs', caminhos[tipo]);
  console.log(`📂 Enviando PDF (${tipo}) para ${numero}: ${caminhoArquivo}`);

  if (!fs.existsSync(caminhoArquivo)) {
    await enviarMensagem(numero, '⚠️ Desculpe! O arquivo PDF não foi encontrado no servidor.');
    return;
  }

  const arquivo = MessageMedia.fromFilePath(caminhoArquivo);
  await sleep(1500);
  await client.sendMessage(numero, arquivo);
  await enviarMensagem(numero, `Se precisar de ajustes ou tiver dúvidas, é só me chamar por aqui! 💬`);
}

// ===== EVENTO DE MENSAGEM =====
client.on('message', async (msg) => {
  console.log('📩 Mensagem recebida de:', msg.from, '-', msg.body);

  const numero = msg.from;
  const texto = msg.body.trim().toLowerCase();
  const nome = msg._data.notifyName || "cliente";

  // NOVO CLIENTE
  if (!usuarios[numero]) {
    console.log('🆕 Novo usuário detectado:', numero);
    usuarios[numero] = { etapa: "inicio", tipo: null, respostas: {} };

    await enviarMensagem(numero, `Olá, ${nome}! 🌷
Sou a *Helena Cutrim*.
Seja muito bem-vindo(a) ao *Comercial Srt. Carolina Chagas*! 💖
É uma alegria receber você por aqui!`);

    await enviarMensagem(numero, `Para agilizar seu atendimento, selecione uma das opções abaixo:
1️⃣ Orçamento Casamento
2️⃣ Orçamento Kids
3️⃣ Orçamento Teen (15 anos)
4️⃣ Agendamento de reunião
5️⃣ Financeiro
6️⃣ Outros assuntos`);
    return;
  }

  const usuario = usuarios[numero];

  // ===== AGUARDANDO COMPROVANTE =====
  if (usuario.etapa === "aguardando_comprovante") {
    console.log(`💳 Recebendo comprovante de ${numero}`);
    usuario.etapa = "fim";
    await enviarMensagem(numero, "Recebemos seu comprovante! 👍 Passaremos para nossa equipe para confirmação e em breve você receberá a confirmação do pagamento.");
    delete usuarios[numero];
    return;
  }

  // ===== MENU PRINCIPAL =====
  if (usuario.etapa === "inicio") {
    console.log(`📋 Etapa inicial (${numero}) → Opção: ${texto}`);

    switch (texto) {
      case "1":
        usuario.tipo = "casamento";
        usuario.etapa = "etapa_nome";
        await enviarMensagem(numero, `💍 Que alegria saber que você está planejando esse momento tão especial! ✨
Por favor, me envie o nome completo dos noivos.`);
        break;

      case "2":
        usuario.tipo = "kids";
        usuario.etapa = "etapa_nome";
        await enviarMensagem(numero, `🎈 Que legal! Vamos preparar o orçamento Kids.
Por favor, me envie o nome e idade do aniversariante.`);
        break;

      case "3":
        usuario.tipo = "teen";
        usuario.etapa = "etapa_nome";
        await enviarMensagem(numero, `🎉 Festa de 15 anos, que incrível! 💖
Por favor, me envie o nome do(a) aniversariante.`);
        break;

      case "4":
        usuario.tipo = "reuniao";
        usuario.etapa = "reuniao_nome";
        await enviarMensagem(numero, `📅 Olá! Será um prazer agendar sua reunião com a Cerimonialista Carolina Chagas.
Por gentileza, envie seu nome completo.`);
        break;

      case "5":
        const chavePix = "98984706448";
        const favorecido = "Ana Carolina Chagas Primo";
        await enviarMensagem(
          numero,
          `💰 *Informações para pagamento via Pix:*\n\n` +
          `🔑 *Chave Pix:* ${chavePix}\n` +
          `👤 *Favorecido:* ${favorecido}\n\n` +
          `📋 _Toque e segure para copiar a chave Pix_\n\n` +
          `Após realizar o pagamento, por favor, envie o comprovante aqui para que possamos confirmar e dar continuidade ao seu atendimento. ✅`
        );
        usuario.etapa = "aguardando_comprovante";
        break;

      case "6":
        await enviarMensagem(numero, `💬 Certo! Por favor, descreva brevemente seu assunto para que o setor responsável possa te atender da melhor forma.`);
        delete usuarios[numero];
        break;

      default:
        await enviarMensagem(numero, `Por favor, escolha uma das opções enviando apenas o número correspondente. 💬`);
        break;
    }
    return;
  }

  // ===== ETAPAS DE ORÇAMENTO =====
  const tiposComPDF = ["casamento", "kids", "teen"];
  if (tiposComPDF.includes(usuario.tipo)) {
    switch (usuario.etapa) {
      case "etapa_nome":
        usuario.respostas.nome = msg.body;
        usuario.etapa = "etapa_data";
        await enviarMensagem(numero, `📅 Agora me envie a data e o local do evento:`);
        break;

      case "etapa_data":
        usuario.respostas.data = msg.body;
        usuario.etapa = "etapa_tipoServico";
        await enviarMensagem(numero, `🌿 Informe o tipo de serviço desejado (ex: organização completa, coordenação do dia, consultoria):`);
        break;

      case "etapa_tipoServico":
        usuario.respostas.tipoServico = msg.body;
        usuario.etapa = "etapa_perguntas";
        await enviarMensagem(numero, `Antes de te encaminhar nosso mini e-book de apresentação e orçamento, posso te fazer três perguntinhas rápidas? 💌

1️⃣ Quantas pessoas irão ao evento?
2️⃣ A recepção acontecerá em qual horário e local?
3️⃣ O evento vai acontecer em São Luís - MA?`);
        break;

      case "etapa_perguntas":
        usuario.respostas.perguntas = msg.body;
        usuario.etapa = "fim";
        await enviarMensagem(numero, `Perfeito! Agora vou te enviar nosso mini e-book de apresentação. 📘✨`);
        await enviarPDF(numero, usuario.tipo);
        delete usuarios[numero];
        break;
    }
  }
});

// ===== INICIALIZAÇÃO =====
client.initialize();
