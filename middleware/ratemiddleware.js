import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    handler: function (req, res) {
      res.status(429).send("Too many requests. Please try again later.");
    },
  });

export default limiter;