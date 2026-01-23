// import { useState, useEffect } from 'react'
// import { useNavigate, useLocation } from 'react-router-dom'
// // import { loadStripe } from '@stripe/stripe-js'
// // import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
// import axios from 'axios'
// import toast from 'react-hot-toast'
// import Navbar from '../../components/Navbar'
// import { useAuth } from '../../context/AuthContext'

// // Initialize Stripe
// // const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder')

// // const CheckoutForm = ({ items, total, onSuccess }) => {
// //   const stripe = useStripe()
// //   const elements = useElements()
// //   const [processing, setProcessing] = useState(false)
// //   const [shippingAddress, setShippingAddress] = useState({
// //     name: '',
// //     street: '',
// //     city: '',
// //     state: '',
// //     country: 'Nigeria',
// //     zipCode: '',
// //     phone: ''
// //   })

// //   const handleSubmit = async (e) => {
// //     e.preventDefault()

// //     if (!stripe || !elements) {
// //       return
// //     }

//     setProcessing(true)

//     try {
//       // Confirm payment
//       const { error: submitError } = await elements.submit()
//       if (submitError) {
//         toast.error(submitError.message)
//         setProcessing(false)
//         return
//       }

//       // const { error, paymentIntent } = await stripe.confirmPayment({
//       //   elements,
//       //   confirmParams: {
//       //     return_url: `${window.location.origin}/my-orders`,
//       //   },
//       //   redirect: 'if_required'
//       // })

//   //     if (error) {
//   //       toast.error(error.message)
//   //       setProcessing(false)
//   //       return
//   //     }

//   //     if (paymentIntent.status === 'succeeded') {
//   //       // Confirm payment on backend and create order
//   //       const response = await axios.post('/api/payments/confirm', {
//   //         paymentIntentId: paymentIntent.id,
//   //         shippingAddress,
//   //         billingAddress: shippingAddress
//   //       })

//   //       if (response.data.success) {
//   //         toast.success('Order placed successfully!')
//   //         onSuccess()
//   //       } else {
//   //         toast.error('Failed to create order')
//   //       }
//   //     }
//   //   } catch (error) {
//   //     console.error('Payment error:', error)
//   //     toast.error(error.response?.data?.message || 'Payment failed')
//   //   } finally {
//   //     setProcessing(false)
//   //   }
//   // }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6">
//       <div className="card p-6">
//         <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
//         <div className="grid md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Full Name *
//             </label>
//             <input
//               type="text"
//               className="input w-full"
//               value={shippingAddress.name}
//               onChange={(e) => setShippingAddress({ ...shippingAddress, name: e.target.value })}
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Phone Number *
//             </label>
//             <input
//               type="tel"
//               className="input w-full"
//               value={shippingAddress.phone}
//               onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
//               required
//             />
//           </div>
//           <div className="md:col-span-2">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Street Address *
//             </label>
//             <input
//               type="text"
//               className="input w-full"
//               value={shippingAddress.street}
//               onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               City *
//             </label>
//             <input
//               type="text"
//               className="input w-full"
//               value={shippingAddress.city}
//               onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               State *
//             </label>
//             <input
//               type="text"
//               className="input w-full"
//               value={shippingAddress.state}
//               onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Zip Code
//             </label>
//             <input
//               type="text"
//               className="input w-full"
//               value={shippingAddress.zipCode}
//               onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Country *
//             </label>
//             <input
//               type="text"
//               className="input w-full"
//               value={shippingAddress.country}
//               onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
//               required
//             />
//           </div>
//         </div>
//       </div>

//       <div className="card p-6">
//         <h2 className="text-xl font-bold mb-4">Payment Details</h2>
//         <PaymentElement />
//       </div>

//       {/* <button
//         type="submit"
//         disabled={!stripe || processing}
//         className="btn btn-primary w-full text-lg py-3"
//       >
//         {processing ? 'Processing...' : `Pay ${new Intl.NumberFormat('en-NG', {
//           style: 'currency',
//           currency: 'NGN'
//         }).format(total)}`}
//       </button> */}
//     </form>
//   )
// }

// // const Checkout = () => {
// //   const [clientSecret, setClientSecret] = useState('')
// //   const [loading, setLoading] = useState(true)
// //   const [items, setItems] = useState([])
// //   const [total, setTotal] = useState(0)
// //   const [orderCreated, setOrderCreated] = useState(false)
// //   const navigate = useNavigate()
// //   const location = useLocation()
// //   const { user } = useAuth()

// //   useEffect(() => {
// //     if (!user || user.role !== 'customer') {
// //       navigate('/login')
// //       return
// //     }

//     fetchCartAndCreatePaymentIntent()
//   }, [user, navigate])

//   const fetchCartAndCreatePaymentIntent = async () => {
//     try {
//       // Get cart items
//       const cartResponse = await axios.get('/api/cart')
//       if (cartResponse.data.success) {
//         const cart = cartResponse.data.data
//         const cartItems = cart.items || []
        
//         if (cartItems.length === 0) {
//           toast.error('Your cart is empty')
//           navigate('/cart')
//           return
//         }

//         setItems(cartItems)
//         setTotal(cart.total || 0)

//         // Create payment intent
//         const paymentResponse = await axios.post('/api/payments/create-payment-intent', {
//           items: cartItems.map(item => ({
//             productId: item.productId,
//             price: item.price,
//             quantity: item.quantity
//           })),
//           shippingAddress: {}
//         })

//         if (paymentResponse.data.success) {
//           setClientSecret(paymentResponse.data.data.clientSecret)
//         } else {
//           toast.error('Failed to initialize payment')
//         }
//       }
//     } catch (error) {
//       console.error('Error:', error)
//       toast.error(error.response?.data?.message || 'Failed to load checkout')
//       navigate('/cart')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const handleOrderSuccess = () => {
//     setOrderCreated(true)
//     setTimeout(() => {
//       navigate('/my-orders')
//     }, 2000)
//   }

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-NG', {
//       style: 'currency',
//       currency: 'NGN'
//     }).format(amount)
//   }

//   if (!user || user.role !== 'customer') {
//     return null
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="flex justify-center py-12">
//             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   if (orderCreated) {
//     return (
//       <div className="min-h-screen bg-gray-50">
//         <Navbar />
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//           <div className="card text-center py-12">
//             <div className="text-6xl mb-4">✅</div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
//             <p className="text-gray-600 mb-6">Redirecting to your orders...</p>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   const options = {
//     clientSecret,
//     appearance: {
//       theme: 'stripe',
//     },
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Checkout</h1>

//         <div className="grid md:grid-cols-3 gap-8">
//           <div className="md:col-span-2">
//             {clientSecret && (
//               <Elements stripe={stripePromise} options={options}>
//                 <CheckoutForm items={items} total={total} onSuccess={handleOrderSuccess} />
//               </Elements>
//             )}
//           </div>

//           <div className="md:col-span-1">
//             <div className="card p-6 sticky top-4">
//               <h2 className="text-xl font-bold mb-4">Order Summary</h2>
//               <div className="space-y-2 mb-4">
//                 {items.map((item, index) => (
//                   <div key={index} className="flex justify-between text-sm">
//                     <span>{item.name} x {item.quantity}</span>
//                     <span>{formatCurrency(item.price * item.quantity)}</span>
//                   </div>
//                 ))}
//                 <div className="border-t pt-2 mt-2">
//                   <div className="flex justify-between font-bold text-lg">
//                     <span>Total</span>
//                     <span>{formatCurrency(total)}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default Checkout
