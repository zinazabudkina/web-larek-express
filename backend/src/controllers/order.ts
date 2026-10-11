import {
  NextFunction,
  Request,
  Response,
} from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    total,
    items,
  } = req.body;

  Product.find({
    _id: { $in: items },
  })
    .then((products) => {
      // Проверяем, что каждый товар из заказа существует в базе.
      // Один и тот же товар может встречаться в заказе несколько раз.
      const allProductsExist = items.every((itemId: string) => (
        products.some(
          (product) => product._id.toString() === itemId,
        )
      ));

      if (!allProductsExist) {
        return next(
          new BadRequestError(
            'Один или несколько товаров не существуют',
          ),
        );
      }

      // Проверяем, что все товары продаются
      const unavailableProduct = products.some(
        (product) => product.price === null,
      );

      if (unavailableProduct) {
        return next(
          new BadRequestError(
            'Один или несколько товаров не продаются',
          ),
        );
      }

      // Рассчитываем сумму заказа.
      const calculatedTotal = items.reduce(
        (sum: number, itemId: string) => {
          const product = products.find(
            (item) => item._id.toString() === itemId,
          );

          return sum + (product?.price ?? 0);
        },
        0,
      );

      // Проверяем переданную клиентом сумму
      if (calculatedTotal !== total) {
        return next(
          new BadRequestError(
            'Сумма заказа указана неверно',
          ),
        );
      }

      return res.status(201).send({
        id: faker.string.uuid(),
        total,
      });
    })
    .catch(next);
};

export default createOrder;
