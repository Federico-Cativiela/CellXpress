
// // Agrega esto después de tus rutas existentes
// app.post('/webhook/stripe', async (req, res) => {
//   const payload = req.body;
    
//     // Verifica la firma del webhook
//     const endpointSecret = 'k_test_51NccbYLQEdx2wACSJ21hlx0Y1Bx9j5eKHRyJqAnIjInB32qgNGW76bkPdP3Qt7JbcFc6UCaRkAV8LVhetHRAyRjx00SIUry2yX'; // Obtén esto desde tu panel de Stripe
//     const sig = req.headers['stripe-signature'];
  
//     let event;
  
//     try {
//       event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
//     } catch (err) {
//       console.error('Firma del webhook incorrecta.', err);
//       return res.status(400).send(`Firma del webhook incorrecta: ${err.message}`);
//     }
  
//     // Maneja el evento según el tipo
//     if (event.type === 'checkout.session.completed') {
//       const session = event.data.object;
  
//       // Aquí puedes guardar la información de la sesión en tu base de datos
//       // Por ejemplo, puedes guardar session.id, session.amount_total, session.customer_email, etc.
  
//       console.log('Pago exitoso:', session.id);
//     }
  
//     res.json({ received: true });
//   });
  