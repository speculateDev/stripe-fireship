"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../utils/supabaseClient";
import { User } from "@supabase/supabase-js";
import LoginForm from "./LoginForm";
import toast from "react-hot-toast";

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [stripeCustomer, setStripeCustomer] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);

      if (user) {
        const { data: stripeCustomerData, error } = await supabase
          .from("stripe_customers")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error) {
          console.log("no stripe customer data found.");
        } else {
          setStripeCustomer(stripeCustomerData);
        }
      }
    };
    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN") {
          setUser(session.user);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setStripeCustomer(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
  };

  return (
    <div>
      <h1>User data</h1>

      {user ? (
        <>
          <p>
            Signed in with email: <strong>{user.email}</strong>
          </p>
          <p>
            Supabase User ID: <strong>{user.id}</strong>
          </p>

          <div>
            <button
              className="btn btn-secondary my-3 btn-sm"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          <h2>Stripe Customer data</h2>
          {stripeCustomer ? (
            <>
              <p>This data lives in teh stripe_customers table in supabase</p>
              <div className="mockup-code">
                <pre>
                  <code>{JSON.stringify(stripeCustomer, null, 2)}</code>
                </pre>
              </div>
            </>
          ) : (
            <div>
              <p>Stripe customer data not created yet. Buy a plan!</p>
            </div>
          )}
        </>
      ) : (
        <>
          <p>No user logged in.</p>
          <LoginForm />
        </>
      )}
    </div>
  );
}
