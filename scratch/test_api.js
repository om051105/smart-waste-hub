import handler from '../api/index.js';

const req = {
  url: '/auth/register',
  method: 'POST',
  headers: {
    'content-type': 'application/json'
  },
  body: {
    name: 'test', email: 'test@example.com', password: 'password', role: 'citizen', area: 'delhi'
  }
};

const res = {
  status: (code) => {
    console.log('Status set to:', code);
    return res;
  },
  json: (data) => {
    console.log('Response JSON:', data);
  },
  end: () => {
    console.log('Response End');
  },
  send: (text) => {
    console.log('Response text:', text);
  }
};

handler(req, res).catch(console.error);
