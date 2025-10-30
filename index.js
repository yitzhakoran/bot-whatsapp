require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
app.use(bodyParser.json());

// Configurações
const token = process.env.WHATSAPP_TOKEN;
const phoneNumberId = process.env.PHONE_NUMBER_ID;
const verifyToken = process.env.VERIFY_TOKEN;
const API_VERSION = 'v20.0';

// Links dos PDFs
const PDF_CASAMENTO = process.env.PDF_CASAMENTO;
const PDF_KIDS = process.env.PDF_KIDS;
const PDF_TEEN = process.env.PDF_TEEN;

// Estado do usuário (em produção, use Redis ou banco)
const userState = new Map();

// Delay entre mensagens
const delay = ms => new Promise(res => setTimeout(res, ms));

// -------- Funções de Envio --------

async function enviarTexto(to, texto) {
    try {
        const mensagem = {
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: { body: texto }
        };
        await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`,
            mensagem,
            { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Erro ao enviar texto:', error.response?.data || error.message);
    }
}

async function enviarPDF(to, linkPdf, nomePdf) {
    if (!linkPdf) {
        console.error('Link do PDF não configurado!');
        return;
    }
    try {
        const mensagem = {
            messaging_product: "whatsapp",
            to,
            type: "document",
            document: { link: linkPdf, filename: nomePdf }
        };
        await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`,
            mensagem,
            { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Erro ao enviar PDF:', error.response?.data || error.message);
    }
}

async function enviarBotaoPIX(to) {
    try {
        const mensagem = {
            messaging_product: "whatsapp",
            to,
            type: "interactive",
            interactive: {
                type: "button",
                body: { text: "Olá! Para pagamentos, use nossa chave PIX: `98984706448`" },
                action: {
                    buttons: [
                        {
                            type: "copy_code",
                            copy_code: { code: "98984706448" }
                        }
                    ]
                }
            }
        };
        await axios.post(
            `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`,
            mensagem,
            { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Erro ao enviar botão PIX:', error.response?.data || error.message);
    }
}

// -------- Fluxos --------

async function fluxoCasamento(to, nome) {
    await enviarTexto(to, `Olá, ${nome}, sou a Helena Cutrim.\n\nSeja muito bem-vindo(a) ao Comercial Srt. Carolina Chagas. É uma alegria receber você por aqui!\n\nPara enviarmos uma proposta personalizada, por gentileza, nos informe:\n- Nome completo dos noivos\n- Data e local do casamento\n- Tipo de serviço desejado (cerimonial completo, assessoria parcial ou consultoria)`);
    await delay(1000);
    await enviarTexto(to, `Antes de te encaminhar nosso mini e-book, posso te fazer duas perguntinhas rápidas?\n1️⃣ O evento será para quantas pessoas?\n2️⃣ A cerimônia e a recepção serão no mesmo local?\n3️⃣ O evento vai acontecer em São Luís - MA?\nAssim consigo te enviar algo bem personalizado pra vocês.`);
    await delay(800);
    await enviarPDF(to, PDF_CASAMENTO, 'Mini_Ebook_Casamento.pdf');
    await enviarTexto(to, 'Aqui está o mini e-book de apresentação com todos os detalhes sobre nossos serviços e planos. 📘✨');
    await enviarTexto(to, 'Se precisar de ajustes ou tiver dúvidas, é só me chamar por aqui! 💬');
}

async function fluxoKids(to, nome) {
    await enviarTexto(to, `Olá, ${nome}, sou a Helena Cutrim.\n\nOii! 🎉\nFicamos muito felizes com seu interesse em nossos serviços!\nPara encaminharmos o orçamento, poderia nos informar:\n- Nome e idade do aniversariante\n- Data e local da festa\n- Tipo de serviço desejado (organização completa, coordenação do dia ou consultoria)\n\nLogo entraremos em contato com uma proposta personalizada. 💖`);
    await delay(1000);
    await enviarPDF(to, PDF_KIDS, 'Mini_Ebook_Kids.pdf');
    await enviarTexto(to, 'Aqui está o mini e-book de apresentação com todos os detalhes sobre nossos serviços e planos. 📘✨');
    await enviarTexto(to, 'Se precisar de ajustes ou tiver dúvidas, é só me chamar por aqui! 💬');
}

async function fluxoTeen(to, nome) {
    await enviarTexto(to, `Olá, ${nome}, sou a Helena Cutrim.\n\nOii! 🎉\nFicamos muito felizes com seu interesse em nossos serviços!\nPara encaminharmos o orçamento, poderia nos informar:\n- Nome da(o) aniversariante\n- Data e local da festa\n- Tipo de serviço desejado (organização completa, coordenação do dia ou consultoria)\n\nLogo entraremos em contato com uma proposta personalizada. 💖`);
    await delay(1000);
    await enviarPDF(to, PDF_TEEN, 'Mini_Ebook_Teen.pdf');
    await enviarTexto(to, 'Aqui está o mini e-book de apresentação com todos os detalhes sobre nossos serviços e planos. 📘✨');
    await enviarTexto(to, 'Se precisar de ajustes ou tiver dúvidas, é só me chamar por aqui! 💬');
}

async function fluxoAgendamento(to, nome) {
    await enviarTexto(to, `Olá, ${nome}, sou a Helena Cutrim.\n\nOlá! 🌷\nSerá um prazer agendar sua reunião com a Cerimonialista Carolina Chagas.\nPor gentileza, nos envie:\n- Seu nome completo\n- Motivo da reunião\n- Dias e horários de preferência\n\nNossa equipe verificará a agenda e retornará confirmando o melhor horário disponível. 💍`);
}

async function fluxoFinanceiro(to) {
    await enviarBotaoPIX(to);
    await delay(800);
    await enviarTexto(to, 'Chave PIX copiada com sucesso! 💸\nQualquer dúvida, estou por aqui.');
}

async function fluxoOutrosAssuntos(to) {
    await enviarTexto(to, 'Olá! 🌷\nSe o seu assunto não se encaixa nas opções anteriores, fique à vontade para nos escrever.\nNossa equipe analisará e retornará com a melhor orientação. 💬');
}

// -------- Webhook GET (Validação) --------
app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === verifyToken) {
            console.log('Webhook verificado com sucesso!');
            return res.status(200).send(challenge);
        } else {
            return res.sendStatus(403);
        }
    }
    res.sendStatus(400);
});

// -------- Webhook POST (Receber Mensagens) --------
app.post('/webhook', async (req, res) => {
    try {
        const entry = req.body.entry?.[0]?.changes?.[0]?.value;
        const mensagens = entry?.messages;

        if (!mensagens?.[0]) {
            return res.sendStatus(200);
        }

        const msg = mensagens[0];
        const from = msg.from;
        const texto = (msg.text?.body || '').toLowerCase().trim();
        const nome = msg.profile?.name || 'amigo(a)';

        let state = userState.get(from) || 'initial';

        // Primeiro contato: enviar menu
        if (state === 'initial') {
            await enviarTexto(from, `Olá, sou a Helena Cutrim.\n\nSeja muito bem-vindo(a) ao Comercial Srt. Carolina Chagas. É uma alegria receber você por aqui!\n\nPara agilizar seu atendimento, selecione uma das opções abaixo:\n\n1️⃣ Orçamento Casamento\n2️⃣ Orçamento Kids\n3️⃣ Orçamento Teen (15 anos)\n4️⃣ Agendamento de reunião\n5️⃣ Financeiro\n6️⃣ Outros assuntos`);
            userState.set(from, 'awaiting_option');
            return res.sendStatus(200);
        }

        // Aguardando opção
        if (state === 'awaiting_option') {
            let executado = true;

            if (texto.includes('1')) await fluxoCasamento(from, nome);
            else if (texto.includes('2')) await fluxoKids(from, nome);
            else if (texto.includes('3')) await fluxoTeen(from, nome);
            else if (texto.includes('4')) await fluxoAgendamento(from, nome);
            else if (texto.includes('5')) await fluxoFinanceiro(from);
            else if (texto.includes('6')) await fluxoOutrosAssuntos(from);
            else {
                executado = false;
                await enviarTexto(from, '⚠️ Por favor, escolha uma opção válida de 1 a 6.');
            }

            if (executado) {
                userState.delete(from); // Fluxo concluído
            }
        }

        // Marcar como lido
        try {
            await axios.post(
                `https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`,
                {
                    messaging_product: "whatsapp",
                    status: "read",
                    message_id: msg.id
                },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
        } catch (error) {
            // Ignorar erro de leitura
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Erro crítico no webhook:', error);
        res.sendStatus(500);
    }
});

// -------- Servidor --------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Bot rodando na porta ${PORT}`);
    console.log(`Acesse: http://localhost:${PORT}`);
});
