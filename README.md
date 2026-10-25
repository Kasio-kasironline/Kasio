# Kasio — Simple POS for Small Businesses

Kasio is a web-based Point of Sale (POS) application designed to help small businesses manage products, process sales, record payments, and monitor their sales performance through a simple and intuitive interface.

Built as a portfolio project, Kasio focuses on usability, responsive design, and reliable transaction management.

## ✨ Features

### MVP
- **Business Setup** — Configure basic business information.
- **Product Management** — Create, edit, and manage products and categories.
- **Point of Sale** — Add products to a cart, adjust quantities, and calculate transaction totals.
- **Payment Recording** — Support cash and manual QRIS payment confirmation.
- **Transaction History** — Review previous sales and transaction details.
- **Sales Dashboard** — View basic sales summaries and product performance.
- **QRIS Configuration** — Upload and display the business's existing QRIS code.
- **Authentication** — Secure user authentication and business data isolation.

> Payment gateway integration is not included in the initial MVP. QRIS payments are recorded manually and are not automatically verified by a payment provider.

## 🛠️ Tech Stack

| Technology | Purpose |
| --- | --- |
| React | User interface |
| Vite | Development server and build tool |
| JavaScript | Application logic |
| Tailwind CSS | Styling and responsive layouts |
| Supabase Auth | User authentication |
| Supabase PostgreSQL | Database |
| Supabase Row Level Security (RLS) | Data access control |
| Supabase Storage | QRIS and optional product images |
| Vercel | Frontend deployment |

## 🏗️ Project Structure

```text
kasio/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   ├── features/
│   │   ├── auth/
│   │   ├── products/
│   │   ├── pos/
│   │   ├── transactions/
│   │   └── analytics/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   └── migrations/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

*The structure may evolve during implementation.*

## 🔐 Security

- Business data must be isolated using Supabase Row Level Security.
- Sensitive service-role keys must never be exposed in frontend code.
- Transaction totals and product prices must be validated by trusted database operations.
- Historical transactions should preserve product names and prices at the time of sale.

## 🗺️ Roadmap

- ✅ Authentication and business onboarding
- ✅ Product and category management
- ✅ POS cart and checkout
- ✅ Cash and manual QRIS payments
- ✅ Transaction history and receipts
- ✅ Sales analytics dashboard
- ✅ Responsive UI improvements
- [ ] Automated payment gateway integration
- [ ] Additional business management features

## 🎯 Project Goals

Kasio aims to demonstrate practical skills in frontend development, UI/UX design, database integration, authentication, and secure transaction workflows while building a foundation for a useful POS product for small businesses.

## 📄 License

License to be determined.
