import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { errors } from 'celebrate';
import {
  requestLogger,
  errorLogger,
} from './middlewares/logger';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import NotFoundError from './errors/not-found-error';
import errorHandler from './middlewares/error-handler';
import { PORT, DB_ADDRESS } from './config';

const app = express();
app.use(cors());

mongoose.connect(DB_ADDRESS);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(requestLogger);

app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use((_req, _res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
