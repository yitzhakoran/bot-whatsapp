const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const express = require('express');

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
client.on('ready', () => {
  console.log('🤖 Bot conectado com sucesso!');
});

// ===== ARMAZENAMENTO DE USUÁRIOS =====
const usuarios = {};

// ===== FUNÇÃO DE ENVIO =====
async function enviarMensagem(destino, texto) {
  const tempo = delayAleatorio();
  await sleep(tempo);
  try {
    await client.sendMessage(destino, texto);
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
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const express = require('express');

// ===== FUNÇÕES AUXILIARES =====
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const delayAleatorio = () => Math.floor(Math.random() * (5000 - 2000 + 1)) + 2000;

// ===== CRIAÇÃO DO CLIENTE =====
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] }
});

// ===== EVENTO QR =====
client.on('qr', qr => {
    console.log('📱 Escaneie o QR Code com o WhatsApp Business:');
    qrcode.generate(qr, { small: true });
});

// ===== EVENTO READY =====
client.on('ready', () => {
    console.log('🤖 Bot conectado com sucesso!');
});

// ===== ARMAZENAMENTO DE USUÁRIOS =====
const usuarios = {};

// ===== FUNÇÃO DE ENVIO =====
async function enviarMensagem(destino, texto) {
    const tempo = delayAleatorio();
    await client.sendStateTyping(destino);
    await sleep(tempo);
    await client.sendMessage(destino, texto);
    await client.clearState(destino);
}

// ===== FUNÇÃO PARA ENVIAR PDF =====
async function enviarPDF(numero, tipo) {
    const caminhos = {
        casamento: 'Casamento.pdf',
        kids: 'Kids.pdf',
        teen: 'Teen.pdf'
    };

    const caminhoArquivo = path.join(__dirname, 'pdfs', caminhos[tipo]);

    if (!fs.existsSync(caminhoArquivo)) {
        await enviarMensagem(numero, '⚠️ Arquivo PDF não encontrado.');
        return;
    }

    const arquivo = MessageMedia.fromFilePath(caminhoArquivo);
    await sleep(1500);
    await client.sendMessage(numero, arquivo);
    await enviarMensagem(numero, 'Se precisar de ajustes ou dúvidas, me chame aqui! 💬');
}

// ===== EVENTO DE MENSAGEM =====
client.on('message', async (msg) => {
    const numero = msg.from;
    const texto = msg.body.trim().toLowerCase();
    const nome = msg._data.notifyName || "cliente";

    if (!usuarios[numero]) {
        usuarios[numero] = { etapa: "inicio", tipo: null, respostas: {} };
        await enviarMensagem(numero, `Olá, ${nome}! 🌷\nSou a *Helena Cutrim*.\nSeja bem-vindo(a) ao *Comercial Srt. Carolina Chagas*! 💖`);
        await enviarMensagem(numero, `Escolha uma opção:\n1️⃣ Casamento\n2️⃣ Kids\n3️⃣ Teen (15 anos)\n4️⃣ Agendar reunião\n5️⃣ Financeiro\n6️⃣ Outros assuntos`);
        return;
    }

    const usuario = usuarios[numero];

    if (usuario.etapa === "aguardando_comprovante") {
        usuario.etapa = "fim";
        await enviarMensagem(numero, "Recebemos seu comprovante! 👍 Passaremos para nossa equipe para confirmação.");
        delete usuarios[numero];
        return;
    }

    if (usuario.etapa === "inicio") {
        switch (texto) {
            case "1": usuario.tipo = "casamento"; usuario.etapa = "etapa_nome"; await enviarMensagem(numero, "💍 Nome completo dos noivos?"); break;
            case "2": usuario.tipo = "kids"; usuario.etapa = "etapa_nome"; await enviarMensagem(numero, "🎈 Nome e idade do aniversariante?"); break;
            case "3": usuario.tipo = "teen"; usuario.etapa = "etapa_nome"; await enviarMensagem(numero, "🎉 Nome do(a) aniversariante?"); break;
            case "4": usuario.tipo = "reuniao"; usuario.etapa = "reuniao_nome"; await enviarMensagem(numero, "📅 Envie seu nome completo para agendar reunião."); break;
            case "5":
                const chavePix = "98984706448";
                const favorecido = "Ana Carolina Chagas Primo";
                await enviarMensagem(numero, `💰 Pix:\n🔑 ${chavePix}\n👤 ${favorecido}\n\nApós pagamento, envie o comprovante aqui.`);
                usuario.etapa = "aguardando_comprovante";
                break;
            case "6": await enviarMensagem(numero, "💬 Descreva seu assunto, por favor."); delete usuarios[numero]; break;
            default: await enviarMensagem(numero, "Escolha apenas o número correspondente. 💬"); break;
        }
        return;
    }

    const tiposComPDF = ["casamento","kids","teen"];
    if (tiposComPDF.includes(usuario.tipo)) {
        switch (usuario.etapa) {
            case "etapa_nome": usuario.respostas.nome = msg.body; usuario.etapa = "etapa_data"; await enviarMensagem(numero,"📅 Data e local do evento?"); break;
            case "etapa_data": usuario.respostas.data = msg.body; usuario.etapa = "etapa_tipoServico"; await enviarMensagem(numero,"🌿 Tipo de serviço (ex: completo, coordenação ou consultoria)?"); break;
            case "etapa_tipoServico": usuario.respostas.tipoServico = msg.body; usuario.etapa = "etapa_perguntas"; await enviarMensagem(numero,"Três perguntinhas rápidas:\n1️⃣ Número de convidados?\n2️⃣ Horário e local da recepção?\n3️⃣ Vai acontecer em São Luís - MA?"); break;
            case "etapa_perguntas": usuario.respostas.perguntas = msg.body; usuario.etapa = "fim"; await enviarMensagem(numero,"Perfeito! Enviando nosso mini e-book 📘✨"); await enviarPDF(numero, usuario.tipo); delete usuarios[numero]; break;
        }
    }
});

// ===== INICIALIZAÇÃO DO CLIENTE =====
client.initialize();

// ===== EXPRESS PARA RENDER (EVITAR HIBERNAÇÃO) =====
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('🤖 Bot online! 💖');
});

app.listen(PORT, () => console.log(`🌐 Servidor web rodando na porta ${PORT}`));

// ===== RECONEXÃO AUTOMÁTICA =====
client.on('disconnected', (reason) => {
    console.log('❌ Cliente desconectado:', reason);
    client.initialize();
});




