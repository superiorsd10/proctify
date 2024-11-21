import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@repo/db";
import { signUpSchema, validate } from "@repo/validation";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  // Do something with payload
  // For this guide, log payload to console
  const eventType = evt.type;

  if (eventType === "user.created") {
    const receivedData = evt.data;

    const id = receivedData.id;
    const username = receivedData.username;
    const email = receivedData.email_addresses[0].email_address;

    const validationResult = validate(signUpSchema, { id, username, email });

    if (!validationResult.success) {
      return new Response("Sign up validation failed", { status: 200 });
    }

    try {
      const { username, email, id } = validationResult.data;

      const exisitingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (exisitingUser) {
        return new Response("User with this email already exists", {
          status: 200,
        });
      }

      const newUser = await prisma.user.create({
        data: {
          id,
          username,
          email,
        },
      });

      return new Response("User successfully saved in the database", {
        status: 200,
      });
    } catch (error) {
      console.error("Database user creation error", error);
      return new Response("An unknown error occured", { status: 200 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}
