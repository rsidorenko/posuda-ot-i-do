import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'API документация для E-commerce приложения',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: process.env.PRODUCTION_API_URL || 'https://api.example.com',
        description: 'Production server',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Введите JWT токен в формате: Bearer <token>'
        }
      },
      schemas: {
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Кухонный нож' },
            description: { type: 'string', example: 'Острый кухонный нож из нержавеющей стали' },
            price: { type: 'number', format: 'float', example: 1299.99 },
            category: { type: 'string', example: 'Кухонная утварь' },
            images: {
              type: 'array',
              items: { type: 'string', format: 'uri' },
              example: ['https://example.com/images/knife1.jpg']
            },
            stock: { type: 'integer', example: 100 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['name', 'price', 'category']
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            name: { type: 'string', example: 'Иван Иванов' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['email', 'name']
        },
        Order: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  productId: { type: 'string', format: 'uuid' },
                  quantity: { type: 'integer', minimum: 1 },
                  price: { type: 'number', format: 'float' }
                }
              }
            },
            totalAmount: { type: 'number', format: 'float' },
            status: { 
              type: 'string', 
              enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
              example: 'pending'
            },
            shippingAddress: {
              type: 'object',
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zipCode: { type: 'string' },
                country: { type: 'string' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          },
          required: ['userId', 'products', 'shippingAddress']
        },
        Error: {
          type: 'object',
          properties: {
            message: { type: 'string', example: 'Ошибка при выполнении операции' },
            code: { type: 'string', example: 'VALIDATION_ERROR' },
            details: { 
              type: 'array',
              items: { type: 'string' },
              example: ['Неверный формат email']
            }
          }
        }
      },
      parameters: {
        pageParam: {
          in: 'query',
          name: 'page',
          schema: {
            type: 'integer',
            default: 1,
            minimum: 1
          },
          description: 'Номер страницы'
        },
        limitParam: {
          in: 'query',
          name: 'limit',
          schema: {
            type: 'integer',
            default: 10,
            minimum: 1,
            maximum: 100
          },
          description: 'Количество элементов на странице'
        },
        searchQuery: {
          in: 'query',
          name: 'query',
          schema: {
            type: 'string'
          },
          description: 'Поисковый запрос'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Требуется аутентификация',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Доступ запрещен',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Ресурс не найден',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        },
        ValidationError: {
          description: 'Ошибка валидации',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              }
            }
          }
        }
      }
    },
    security: [{
      bearerAuth: []
    }],
    tags: [
      {
        name: 'Products',
        description: 'Операции с продуктами'
      },
      {
        name: 'Users',
        description: 'Операции с пользователями'
      },
      {
        name: 'Orders',
        description: 'Операции с заказами'
      },
      {
        name: 'Auth',
        description: 'Операции аутентификации'
      }
    ]
  },
  apis: ['./src/routes/*.ts'], // Путь к файлам с маршрутами
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec; 