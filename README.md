# fritzuploadchannelmonitor
Monitor AVM Cable 6660 Upload Channels (Rückkanalstörer)

If you have some trouble with Cable Internet and you whant to monitor you upload channels, this will do it for you. This is a nodejs-application. 
You just need to update the options.js with your credential data etc.

you need to add a file called <b>options.js</b> with the following content:

var opti = {
    username: 'xxx',
    password: 'xxx',
    server: 'fritz.box',
    boxip: '192.168.97.40' 
};
module.exports = opti;

<p>
<p>

...dont forget to change username and passwort to your fritzbox username and the password for it!

Have fun!
