import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
  DATABASE_URL: {
    description: 'PostgreSQL connection string for the Wonderful Lombok backend.'
  }
});
