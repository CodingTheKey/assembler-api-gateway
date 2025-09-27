export const swaggerConfig = {
    openapi: '3.0.3',
    info: {
        title: 'Assembleo API Gateway',
        description: 'Gateway centralizador para todos os microserviços do sistema Assembleo',
        version: '1.0.0',
        contact: {
            name: 'API Support',
            email: 'support@assembleo.com'
        }
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Development server'
        },
        {
            url: 'https://assembleo-api-gateway.example.com',
            description: 'Production server'
        }
    ],
    paths: {
        '/health': {
            get: {
                summary: 'Health Check',
                description: 'Verifica o status de saúde do gateway',
                tags: ['Health'],
                responses: {
                    '200': {
                        description: 'Gateway está funcionando',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        status: {
                                            type: 'string',
                                            example: 'healthy'
                                        },
                                        timestamp: {
                                            type: 'string',
                                            format: 'date-time',
                                            example: '2024-01-01T00:00:00.000Z'
                                        },
                                        services: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    path: { type: 'string' },
                                                    target: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        '/api/associates': {
            get: {
                summary: 'Listar associados',
                description: 'Retorna uma lista de todos os associados',
                tags: ['Associates'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Lista de associados',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Associate'
                                    }
                                }
                            }
                        }
                    },
                    '401': {
                        description: 'Token de autenticação inválido'
                    },
                    '500': {
                        description: 'Erro interno do servidor'
                    }
                }
            }
        },
        '/api/unities': {
            get: {
                summary: 'Listar unidades',
                description: 'Retorna uma lista de todas as unidades',
                tags: ['Unities'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Lista de unidades',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Unity'
                                    }
                                }
                            }
                        }
                    },
                    '401': {
                        description: 'Token de autenticação inválido'
                    },
                    '500': {
                        description: 'Erro interno do servidor'
                    }
                }
            }
        },
        '/api/meetings': {
            get: {
                summary: 'Listar reuniões',
                description: 'Retorna uma lista de todas as reuniões',
                tags: ['Meetings'],
                security: [{ bearerAuth: [] }],
                responses: {
                    '200': {
                        description: 'Lista de reuniões',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Meeting'
                                    }
                                }
                            }
                        }
                    },
                    '401': {
                        description: 'Token de autenticação inválido'
                    },
                    '500': {
                        description: 'Erro interno do servidor'
                    }
                }
            }
        }
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            Associate: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'ID único do associado'
                    },
                    name: {
                        type: 'string',
                        description: 'Nome do associado'
                    },
                    email: {
                        type: 'string',
                        description: 'E-mail do associado'
                    }
                }
            },
            Unity: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'ID único da unidade'
                    },
                    name: {
                        type: 'string',
                        description: 'Nome da unidade'
                    },
                    address: {
                        type: 'string',
                        description: 'Endereço da unidade'
                    }
                }
            },
            Meeting: {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'ID único da reunião'
                    },
                    title: {
                        type: 'string',
                        description: 'Título da reunião'
                    },
                    date: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Data e hora da reunião'
                    }
                }
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    error: {
                        type: 'string',
                        description: 'Mensagem de erro'
                    }
                }
            }
        }
    },
    tags: [
        {
            name: 'Health',
            description: 'Verificação de saúde do gateway'
        },
        {
            name: 'Associates',
            description: 'Operações relacionadas aos associados'
        },
        {
            name: 'Unities',
            description: 'Operações relacionadas às unidades'
        },
        {
            name: 'Meetings',
            description: 'Operações relacionadas às reuniões'
        }
    ]
};
