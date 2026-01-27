import "dotenv/config";
import fastify from "fastify";
import fastifyCors from "@fastify/cors";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import fastifyCompress from "@fastify/compress";
import fastifyRateLimit from "@fastify/rate-limit";
import { join } from "path";

import userRoutes from "./routes/user.routes";

const server = fastify({
  logger: {
    level: process.env.LOG_LEVEL || "info",
  },
  bodyLimit: 10485760,
  keepAliveTimeout: 65000,
  requestTimeout: 30000,
});

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : [
    "http://localhost:8888",
    "http://127.0.0.1:8888",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];

server.register(fastifyCors, {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key"],
  credentials: true,
});

server.register(fastifyMultipart, {
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

server.register(fastifyStatic, {
  root: join(__dirname, '../uploads'),
  prefix: '/uploads/',
});

server.register(fastifyCompress, {
  global: true,
  threshold: 1024,
  encodings: ['gzip', 'deflate'],
});

server.register(fastifyRateLimit, {
  max: 100,
  timeWindow: '1 minute',
  skipOnError: true,
});

server.register(fastifySwagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'SaaS API',
      description: 'API documentation for SaaS Base Boilerplate',
      version: '1.0.0',
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === 'production'
            ? `https://${process.env.API_BASE_URL || 'api.example.com'}`
            : `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 8888}`,
        description:
          process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description:
            'JWT Bearer token (e.g., "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
});

server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: false,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
});

const apiPrefix = "/api";

server.get("/health", async (_request, _reply) => {
  const memUsage = process.memoryUsage();
  return {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    performance: {
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
      },
    },
  };
});

server.setErrorHandler((error: Error, _request, reply) => {
  server.log.error(error);

  reply.status(500).send({
    success: false,
    message: "Internal Server Error",
    error: error.message,
  });
});

const start = async () => {
  try {
    console.log('🚀 Starting SaaS Base Boilerplate...');

    console.log('🔗 Registering routes...');

    const routes = [
      { route: userRoutes, name: 'User' }
    ];

    for (const { route, name } of routes) {
      try {
        await server.register(route, { prefix: apiPrefix });
        console.log(`✅ ${name} routes registered`);
      } catch (err: any) {
        console.error(`❌ ${name} routes failed:`, err.message);
      }
    }

    console.log('🔗 All routes registration completed');

    const port = parseInt(process.env.PORT || "8888") || 8888;
    const host = process.env.HOST || "localhost";

    await server.listen({
      port,
      host,
    });

    console.log(`🚀 SaaS Base Boilerplate is running on http://${host}:${port}`);
    console.log(`📊 Health check: http://${host}:${port}/health`);
    console.log(`📚 Swagger Docs: http://${host}:${port}/docs`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();

["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    try {
      console.log(`\n🛑 Received ${signal}, shutting down gracefully...`);

      await server.close();
      console.log(`✅ Fastify server closed on ${signal}`);
      process.exit(0);
    } catch (err) {
      console.error("❌ Error during shutdown:", err);
      process.exit(1);
    }
  });
});
