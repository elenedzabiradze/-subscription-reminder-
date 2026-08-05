"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <main className="container">
      <h1>Subscription Reminder</h1>
      <p>
        Add your subscriptions and get automatic reminders on your Google
        Calendar 1-2 days before each payment is due. No app to install, no
        account to create beyond signing in with Google.
      </p>

      {status === "loading" && <p>Loading...</p>}

      {status !== "loading" && !session && (
        <button className="btn" onClick={() => signIn("google")}>
          Sign in with Google
        </button>
      )}

      {session && (
        <div>
          <p>Signed in as {session.user.email}</p>
          <Link className="btn" href="/dashboard">
            Go to dashboard
          </Link>
          <button className="btn secondary" onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      )}
    </main>
  );
}
