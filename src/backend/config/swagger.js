import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'GadgetZone Admin API',
            version: '1.0.0',
            description: 'API documentation for GadgetZone e-commerce admin platform',
            contact: {
                name: 'GadgetZone Team',
                email: 'support@gadgetzone.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3001/api',
                description: 'Development server'
            },
            {
                url: 'https://api.gadgetzone.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error type'
                        },
                        message: {
                            type: 'string',
                            description: 'Error message'
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'string'
                            },
                            description: 'Detailed error messages'
                        }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'User ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Full name'
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'Email address'
                        },
                        role: {
                            type: 'string',
                            enum: ['user', 'admin'],
                            description: 'User role'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Creation timestamp'
                        }
                    }
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Product ID'
                        },
                        name: {
                            type: 'string',
                            description: 'Product name'
                        },
                        description: {
                            type: 'string',
                            description: 'Product description'
                        },
                        price: {
                            type: 'number',
                            format: 'float',
                            description: 'Product price'
                        },
                        stock: {
                            type: 'integer',
                            description: 'Available stock'
                        },
                        category_id: {
                            type: 'integer',
                            description: 'Category ID'
                        },
                        images: {
                            type: 'array',
                            items: {
                                type: 'string',
                                format: 'uri'
                            },
                            description: 'Product images URLs'
                        }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'integer',
                            description: 'Order ID'
                        },
                        user_id: {
                            type: 'integer',
                            description: 'User ID'
                        },
                        total: {
                            type: 'number',
                            format: 'float',
                            description: 'Order total'
                        },
                        status: {
                            type: 'string',
                            enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
                            description: 'Order status'
                        },
                        created_at: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Order creation timestamp'
                        }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: ['./src/backend/routes/*.js'] // Path to API routes
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerSpec, swaggerUi };
