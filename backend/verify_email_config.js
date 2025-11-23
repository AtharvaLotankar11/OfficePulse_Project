require('dotenv').config();
const nodemailer = require('nodemailer');

async function verifyConfig() {
    console.log('Checking environment variables...');

    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user) {
        console.error('❌ EMAIL_USER is missing in .env');
    } else {
        console.log('✅ EMAIL_USER is set:', user);
    }

    if (!pass) {
        console.error('❌ EMAIL_PASS is missing in .env');
    } else {
        console.log('✅ EMAIL_PASS is set (length: ' + pass.length + ')');
    }

    if (!user || !pass) {
        console.error('Please set EMAIL_USER and EMAIL_PASS in your .env file.');
        return;
    }

    console.log('\nTesting connection to Gmail...');

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: user,
            pass: pass
        }
    });

    try {
        await transporter.verify();
        console.log('✅ Server is ready to take our messages');
        console.log('Authentication successful!');

        console.log('\nAttempting to send a test email to ' + user + '...');

        const fromAddress = process.env.EMAIL_FROM || 'OfficePulse <noreply@officepulse.com>';
        console.log('Using sender address:', fromAddress);

        const info = await transporter.sendMail({
            from: fromAddress,
            to: user,   // Send to self
            subject: 'Test Email from OfficePulse Debugger (Default Sender)',
            text: 'If you see this, email sending with default sender is working!'
        });
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);

    } catch (error) {
        console.error('❌ Error:');
        console.error(error);

        if (error.code === 'EAUTH') {
            console.log('\n💡 Tip: If you are using Gmail, make sure you are using an App Password, not your login password.');
            console.log('See: https://support.google.com/accounts/answer/185833');
        }
    }
}

verifyConfig();
