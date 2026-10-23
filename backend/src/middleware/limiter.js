import rateLimiter from 'express-rate-limit';

const limiter = rateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    status: 429,
    error: 'Too many requests, please try again later.',
  }
});

export default limiter;