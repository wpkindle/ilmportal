const { isGibberish, spamFilter } = require('../src/middleware/spamFilter');

describe('Anti-Spam Filter Middleware & isGibberish Tests', () => {
  describe('isGibberish detection', () => {
    test('detects long random tokens and hashes', () => {
      expect(isGibberish('kLoRVrjoIhtKWMMYtmgQoDdC')).toBe(true);
      expect(isGibberish('BrdNPcUSToFoTMfvJ')).toBe(true);
      expect(isGibberish('JpBAASBlAwYO')).toBe(true);
    });

    test('detects 5+ consecutive consonants and zero vowel words', () => {
      expect(isGibberish('Qwesiva Bhgft')).toBe(true);
      expect(isGibberish('Ygrhnj Eyjkmobpu')).toBe(true);
      expect(isGibberish('xyzqwr')).toBe(true);
    });

    test('allows legitimate names and inquiries', () => {
      expect(isGibberish('Muhammad Ali')).toBe(false);
      expect(isGibberish('Fatima Zahra')).toBe(false);
      expect(isGibberish('Abdul Khaliq')).toBe(false);
      expect(isGibberish('Syed Usman Ali Shah')).toBe(false);
      expect(isGibberish('John Doe')).toBe(false);
      expect(isGibberish('Hello, I would like to learn Quran with Tajweed.')).toBe(false);
      expect(isGibberish('Assalam o Alaikum, please send me tutor fee details')).toBe(false);
      expect(isGibberish('')).toBe(false);
      expect(isGibberish(null)).toBe(false);
    });
  });

  describe('spamFilter middleware', () => {
    test('silently traps bot filling honeypot fields', () => {
      const req = {
        ip: '192.168.1.1',
        body: {
          name: 'Real Looking Name',
          email: 'bot@spam.com',
          hp_website: 'https://spam-link.com',
          message: 'Hello world'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      spamFilter(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    test('blocks requests with gibberish names', () => {
      const req = {
        ip: '192.168.1.1',
        body: {
          name: 'Qwesiva Bhgft',
          email: 'valid@example.com',
          message: 'Valid inquiry message.'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      spamFilter(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    test('blocks requests with gibberish messages', () => {
      const req = {
        ip: '192.168.1.1',
        body: {
          name: 'Tariq Mehmood',
          email: 'valid@example.com',
          message: 'kLoRVrjoIhtKWMMYtmgQoDdC'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      spamFilter(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
    });

    test('allows legitimate requests through to next()', () => {
      const req = {
        ip: '192.168.1.1',
        body: {
          name: 'Usman Ghani',
          email: 'usman@gmail.com',
          message: 'I want to enroll in the Quran memorization course.'
        }
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const next = jest.fn();

      spamFilter(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});

