var app = express();
// ... Dependencies
var bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
 
var port = process.env.PORT || 8080;
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
 
app.listen(port);
console.log("App listening on port : " + port);
let transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io', //used for testing, fake smtp server; replace with real creentials
    port: 2525,
    auth: {
       user: 'userid',
       pass: 'pass'
    }
});

//send mail
app.get('/api/send_plain_mail', function(req, res) {
		console.log('sending email..');
		const message = {
	    from: 'webid@gmail.com', // Sender address
	    to: 'to emailId',         // recipients
	    subject: 'proposal from your wishlist', // Subject line
	    text: 'You have received a proposal for product' // Plain text body
	};
	transport.sendMail(message, function(error, info) {
	    if (error) {
	      console.log(error)
	    } else {
	      console.log('email was sent');
	      console.log(info);
	    }
	});
});

//email with attachments
const message = {
	    from: 'webid@gmail.com', // Sender address
	    to: 'to emailId',         // recipients
	    subject: 'proposal from your wishlist', // Subject line
	    text: '<h2>You have received a proposal for product</h2>', // HTML body
		attachments: [
        { // Use a URL as an attachment
			  filename: 'airplane.url',
			  path: 'https://homepage.webid/account/proposals/airplane.url'
		  }
		]
	}