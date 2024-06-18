const transporter = require("../../config/nodemailer_config")

const budget = async (receiver) => {
    const mailOptions = {
        from: {
            name: 'RA Serviços Dinâmicos',
            address: 'noreply@raservicosdinamicos.com.br'
        },
        to: receiver,
        subject: 'Orçamento Cipa Inova',
        text: `Orçamento solicitado com sucesso por ${receiver}!`,
        html: '<p> não sei como usar isso </p>'
    }

    await transporter.sendMail(mailOptions)
}

const mailRepo = {
    budget
}

module.exports = mailRepo