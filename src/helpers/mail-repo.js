const transporters = require("../../config/nodemailer_config")

const budget = async (name, receiver) => {
    const mailOptions = {
        from: {
            name: 'RA Serviços Dinâmicos',
            address: 'noreply@redeargus.com.br'
        },
        to: receiver,
        subject: 'Orçamento Cipa Inova',
        text: `Assunto: Confirmação de Recebimento de Solicitação de Orçamento

                Olá ${name},

                Agradecemos pelo seu interesse em nossos serviços/produtos. Este e-mail é para confirmar que recebemos sua solicitação de orçamento e estamos processando as informações fornecidas.

                Nosso time está revisando todos os detalhes e entraremos em contato com você em breve com uma proposta personalizada que atenda às suas necessidades. Se houver alguma informação adicional que você gostaria de compartilhar, ou se tiver alguma dúvida enquanto isso, por favor, não hesite em nos contatar.

                Estamos à disposição para ajudar da melhor forma possível e esperamos poder trabalhar com você em breve.

        Atenciosamente,

        Wei Oliveira
        RA Serviços Dinâmicos
        81 981281999
        consultoriarmservicosdinamicos@gmail.com`,
        html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmação de Solicitação de Orçamento</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .container {
            width: 80%;
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #dddddd;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            color: #333;
        }
        .content {
            padding: 20px 0;
        }
        .content p {
            line-height: 1.6;
        }
        .footer {
            padding-top: 20px;
            border-top: 1px solid #dddddd;
            text-align: center;
        }
        .footer p {
            margin: 0;
            font-size: 14px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Confirmação de Solicitação de Orçamento</h1>
        </div>
        <div class="content">
            <p>Olá ${name},</p>
            <p>Agradecemos pelo seu interesse em nossos serviços/produtos. Este e-mail é para confirmar que recebemos sua solicitação de orçamento e estamos processando as informações fornecidas.</p>
            <p>Nosso time está revisando todos os detalhes e entraremos em contato com você em breve com uma proposta personalizada que atenda às suas necessidades. Se houver alguma informação adicional que você gostaria de compartilhar, ou se tiver alguma dúvida enquanto isso, por favor, não hesite em nos contatar.</p>
            <p>Estamos à disposição para ajudar da melhor forma possível e esperamos poder trabalhar com você em breve.</p>
        </div>
        <div class="footer">
            <p>Atenciosamente,</p>
            <p>Wei Oliveira<br>RA Serviços Dinâmicos <br>81 981281999 <br>rmconsultoriaservicosdinamicos@gmail.com</p>
        </div>
    </div>
</body>
</html>
`
    }
    
    await transporters.domainMail.sendMail(mailOptions)
}

const mailRepo = {
    budget
}

module.exports = mailRepo