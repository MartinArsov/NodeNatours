const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, '/views'));

//1)MIDDLEWARES
//GLOBAL
// console.log(process.env.NODE_ENV);

// Serving static files
app.use(express.static(path.join(__dirname, '/public')));

//Security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// Limit requests from same IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP , please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(
  express.json({
    limit: '100kb',
  })
);
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parametar pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingQuantity',
      'difficulty',
      'price',
      'maxGroupSize',
    ],
  })
);

// Content Security Policy
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'", 'data:', 'blob:'],
      fontSrc: ["'self'", 'https:', 'data:'],
      scriptSrc: ["'self'", 'unsafe-inline', 'https://*.cloudflare.com', 'https://js.stripe.com'],
      scriptSrcElem: ["'self'", 'https:', 'https://*.cloudflare.com', 'https://js.stripe.com'],
      styleSrc: ["'self'", 'https:', 'unsafe-inline'],
      connectSrc: [
        "'self'",
        'data:',
        'https://*.cloudflare.com',
        'ws://localhost:*',  // Allow WebSocket connections on any port for localhost
        'ws://127.0.0.1:*',  // Allow WebSocket connections on any port for 127.0.0.1
      ],
      frameSrc: ["'self'", 'https://js.stripe.com'],
    },
  })
);


// Serving static files
// app.use(express.static(`${__dirname}/public`));
// app.use(express.static(path.join(__dirname, '/public')));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  // console.log(req.cookies);
  next();
});

//2)ROUTE HANDLERS

//3)ROUTES
// app.get('/', (req, res) => {
//   res.status(200).render('base', {
//     tour: 'The Forest Hiker',
//     user: 'Martin',
//   });
// });

// app.get('/overview', (req, res) => {
//   res.status(200).render('overview',{
//     title: 'All Tours'
//   });
// });

// app.get('/tour', (req, res) => {
//   res.status(200).render('tour',{
//     title: 'The Forest Hiker Tour'
//   });
// });
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

//4)Start server

module.exports = app;
