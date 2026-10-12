import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Subir a 20 usuarios en 30s
    { duration: '1m', target: 20 },  // Mantener 20 usuarios por 1min
    { duration: '30s', target: 0 },  // Bajar a 0 usuarios en 30s
  ],
};

export default function () {
  const url = 'http://localhost:9000/api/auth/login';
  const payload = JSON.stringify({
    email: 'cruzbarco89@gmail.com',
    password: '123456',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);
  
  check(res, {
    'status es 200': (r) => r.status === 200,
    'tiene token': (r) => r.json('token') !== undefined,
  });

  sleep(1);
}
