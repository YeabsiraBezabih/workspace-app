import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Validate required environment variables
const requiredEnvVars = {
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
  DATABASE_URL: process.env.DATABASE_URL,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error(`([LOG auth_config] ========= Missing required environment variables: ${missingVars.join(', ')})`);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

console.log(`([LOG auth_config] ========= Better Auth initialized with baseURL: ${process.env.BETTER_AUTH_URL})`);

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production with email service
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: true,
      organizationLimit: 10, // Per user
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,
  trustedOrigins: ["http://localhost:3000", "https://workspace-app-six.vercel.app"],
});

export type Session = typeof auth.$Infer.Session;

