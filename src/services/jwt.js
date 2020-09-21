const jwt = require('jsonwebtoken');

const HEADER = 'x-access-token';
const { JWT_SECRET, JWT_EXPIRES_TIME } = process.env;

const jwtService = {
  async verify(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          return reject(err);
        }

        return resolve(decoded);
      });
    });
  },

  sign(data) {
    return jwt.sign(data, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_TIME,
    });
  },
};

const jwtMiddleware = async (req, res, next) => {
  const token = req.headers[HEADER];

  if (!token) {
    res.status(401).json({ message: 'No token provided.' });
    return;
  }

  await jwtService
    .verify(token)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          message: 'Token expired.',
        });
      }

      return res.status(401).json({
        message: 'Failed to autenticate token.',
      });
    });
};

const jwtServiceFactory = () => (req, _, next) => {
  let $cache;

  Object.defineProperty(req, '$jwt', {
    get() {
      if ($cache) {
        return $cache;
      }

      $cache = jwtService;

      return $cache;
    },
  });

  next();
};

module.exports = {
  jwtMiddleware,
  jwtServiceFactory,
};
