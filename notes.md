# Stripe CLI-Webhook command:
- stripe listen -e customer.subscription.updated,customer.subscription.deleted,checkout.session.completed --forward-to http://localhost:3000/webhook

- or: stripe listen -e checkout.session.completed --forward-to http://localhost:3000/api/webhook

