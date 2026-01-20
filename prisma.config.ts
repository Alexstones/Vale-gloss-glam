import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: 'file:./prisma/dev.db',
  },
  // Fuerza el engine de Node (evita el "engineType: client" que pide adapter/accelerateUrl)
  client: {
    engineType: 'binary',
  },
});
