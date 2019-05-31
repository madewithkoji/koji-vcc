// NOTE: consider getting async / await type
// stuff in here, its real messy without it

if(!global.paymentsEnabled) global.paymentsEnabled;
if(!global.requestUrl) global.requestUrl = 'http://localhost:3125';

function checkPurchase(productName) {
    return new Promise((resolve, reject) => {
      const userId = window.localStorage.getItem('userId');
      if(!userId) resolve({ success: false });

      fetch(`${global.requestUrl}/v1/payment/iap/get?userId=${userId}&productName=${productName}`).then((a) => a.json()).then((resp) => {
        resolve(resp);
      }).catch((err) => {
        resolve({ success: false });
      });
    });
}

function arePaymentsEnabled() {
  if(global.paymentsEnabled) {
    return true;
  } else {
    console.error('koji-tools: payments are not enabled, see documentation for more information.');
    return false;
  }
}

function init() {
  global.paymentsEnabled = true;
  let script = 'https://js.stripe.com/v3/';
  let element = document.createElement("script");
  element.type = "text/javascript";
  element.async = true;
  element.src = script;
  document.getElementsByTagName("head")[0].appendChild(element);

  require('./payments-styles.css');
}

function createModal(titleText, subtitleText, priceText) {
  const overlay = document.createElement('div');
  overlay.id = 'koji-payments-overlay';

  const box = document.createElement('div');
  box.id = 'koji-payments-box';

  const title = document.createElement('h2');
  title.id = 'koji-payments-title';
  title.appendChild(document.createTextNode(titleText));

  const subtitle = document.createElement('div');
  subtitle.id = 'koji-payments-subtitle';
  subtitle.appendChild(document.createTextNode(subtitleText));

  const price = document.createElement('div');
  price.id = 'koji-payments-price';
  price.appendChild(document.createTextNode(`$${(priceText/100).toFixed(2)}`));

  const paymentMethods = document.createElement('div');
  paymentMethods.id = 'koji-payments-payment-methods';


  const requestButton = document.createElement('div');
  requestButton.id = 'koji-payments-request-button';

  const cardLink = document.createElement('div');
  cardLink.id = 'koji-payments-card-link';
  cardLink.appendChild(document.createTextNode('Pay with card'));
  cardLink.onclick = () => {
    document.getElementById('koji-payments-card').style.display = 'block';
    document.getElementById('koji-payments-card-link').style.display = 'none';
  }

  const card = document.createElement('div');
  card.id = 'koji-payments-card';
  card.classList.add('koji-payments-or');
  card.style.display = 'none';

  box.appendChild(title);
  box.appendChild(subtitle);
  box.appendChild(price);
  box.appendChild(paymentMethods);
  paymentMethods.appendChild(requestButton);
  paymentMethods.appendChild(cardLink);
  paymentMethods.appendChild(card);
  overlay.appendChild(box);

  document.getElementsByTagName('body')[0].appendChild(overlay);

  return overlay;
}

function prompt({ title, subtitle, price, productName, dismissable }) {
  return new Promise((resolve, reject) => {
    checkPurchase(productName).then((purchase) => {
      if(purchase.success) {
        resolve(purchase.response);
      } else {
        const overlay = createModal(title, subtitle, price);

        // instinate our publishable key.
        const stripe = Stripe('pk_test_7bAzlFq6KLaHcBu3uuCzdb5m');
        const paymentRequest = stripe.paymentRequest({
          country: 'US',
          currency: 'usd',
          total: {
            label: productName,
            amount: price,
          },
          requestPayerName: true,
          requestPayerEmail: true,
        });

        const elements = stripe.elements();

        var elementStyles = {
          base: {
            color: '#32325D',
            fontWeight: 500,
            fontFamily: 'Source Code Pro, Consolas, Menlo, monospace',
            fontSize: '16px',
            fontSmoothing: 'antialiased',

            '::placeholder': {
              color: '#CFD7DF',
            },
            ':-webkit-autofill': {
              color: '#e39f48',
            },
          },
          invalid: {
            color: '#E25950',

            '::placeholder': {
              color: '#FFCCA5',
            },
          },
        };

        const prButton = elements.create('paymentRequestButton', {
          paymentRequest,
        });

        const cardEmailElement = document.createElement('div');
        cardEmailElement.id = 'koji-payments-card-email';
        document.getElementById('koji-payments-card').appendChild(cardEmailElement);

        const cardEmailInputElement = document.createElement('input');
        cardEmailInputElement.id = 'koji-payments-card-email-input';
        cardEmailInputElement.placeholder = 'me@example.com';
        cardEmailInputElement.type = 'email';
        document.getElementById('koji-payments-card-email').appendChild(cardEmailInputElement);

        var cardNumber = elements.create('cardNumber', {
          style: elementStyles,
        });
        const cardNumberElement = document.createElement('div');
        cardNumberElement.id = 'koji-payments-card-number';
        document.getElementById('koji-payments-card').appendChild(cardNumberElement);
        cardNumber.mount('#koji-payments-card-number');

        var cardExpiry = elements.create('cardExpiry', {
          style: elementStyles,
        });
        const cardExpiryElement = document.createElement('div');
        cardExpiryElement.id = 'koji-payments-card-expiry';
        document.getElementById('koji-payments-card').appendChild(cardExpiryElement);
        cardExpiry.mount('#koji-payments-card-expiry');


        var cardCvc = elements.create('cardCvc', {
          style: elementStyles,
        });
        const cardCvcElement = document.createElement('div');
        cardCvcElement.id = 'koji-payments-card-cvc';
        document.getElementById('koji-payments-card').appendChild(cardCvcElement);
        cardCvc.mount('#koji-payments-card-cvc');

        const cardErrors = document.createElement('div');
        cardErrors.id = 'koji-payments-card-errors';
        document.getElementById('koji-payments-card').appendChild(cardErrors);

        const cardButton = document.createElement('button');
        cardButton.id = 'koji-payments-card-button';
        cardButton.onclick = () => {
          // process the payment information through stripe tokenization
          stripe.createToken(cardNumber).then((result) => {
            if (result.error) {
              // Inform the customer that there was an error.
              cardErrors.textContent = result.error.message;
            } else {
              // Send the token to your server.
              handleToken(result, price, productName).then((e) => resolve(e));
            }
          })
        }

        cardButton.appendChild(document.createTextNode(`Pay $${(price/100).toFixed(2)}`));
        document.getElementById('koji-payments-card').appendChild(cardButton);

        paymentRequest.canMakePayment().then((result) => {
          if (result) {
            prButton.mount('#koji-payments-request-button');
          } else {
            // show the reg credit card stuff, bc there's no button here chief
            document.getElementById('koji-payments-request-button').style.display = 'none';
            document.getElementById('koji-payments-card').style.display = 'block';
            document.getElementById('koji-payments-card').classList.remove('koji-payments-or');
            document.getElementById('koji-payments-card-link').style.display = 'none';
          }
        });

        paymentRequest.on('token', (ev) => handleToken(ev, price, productName).then((e) => resolve(e)));
      }
    });
  })
}

function handleToken(ev, price, productName) {
  return new Promise((resolve, reject) => {
    const email = ev.payerEmail || document.getElementById('koji-payments-card-email-input').value;
    window.localStorage.setItem('userId', email);
    const response = fetch(`${global.requestUrl}/v1/payment/iap/pay`, {
      method: 'post',
      body: JSON.stringify({
        token: ev.token.id,
        userId: email,
        productName: productName,
        price,
      }),
      headers:{
        'Content-Type': 'application/json',
      },
    }).then((resp) => resp.json()).then((response) => {
      console.log(response);
      if(!response.success) {
        document.getElementById('koji-payments-card-errors').textContent = response.data.error;
        reject(response.data);
      } else {
        document.getElementById('koji-payments-overlay').style.display = 'none';
        if(ev.complete) ev.complete('success');
        resolve(response);
      }
    });
  })
}

exports.checkPurchase = checkPurchase;
exports.prompt = prompt;
exports.init = init;
