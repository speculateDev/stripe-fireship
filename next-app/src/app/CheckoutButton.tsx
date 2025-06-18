"use client";

import { loadStripe } from "@stripe/stripe-js";
import { supabase } from "../../utils/supabaseClient";
import toast from "react-hot-toast";

export default function CheckoutButton() {
  async function handleCheckout() {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      toast.error("Pleas log in to create a new Stripe checkout session");
      return;
    }

    const stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    );
    const stripe = await stripePromise;

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        priceId: "price_1Rb5KZIkn2z7frMRT2MBS11s",
        userId: data.user?.id,
        email: data.user?.email,
      }),
    });

    console.log("Response:", response); // Log the response
    const session = await response.json();
    await stripe?.redirectToCheckout({ sessionId: session.id });
  }

  return (
    <div>
      <h1>Signup for a plan</h1>
      <p>Clicking this button creates a new Stripe Checkout session</p>
      <button className="btn btn-accent" onClick={handleCheckout}>
        Buy Now
      </button>
    </div>
  );
}
