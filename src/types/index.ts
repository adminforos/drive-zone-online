export type UserRole = 'user' | 'admin';
export type AccountStatus = 'active' | 'suspended';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  whatsApp: string;
  gamingId: string;
  photoURL: string;
  role: UserRole;
  balance: number;
  totalDeposits: number;
  totalSpending: number;
  totalTransfers: number;
  status: AccountStatus;
  createdAt: string;
}

export type ProductCategory =
  | 'Vehicles & Skins'
  | 'Game Accounts'
  | 'In-Game Coins/Diamonds'
  | 'VIP & Passes'
  | 'Other';

export type ProductStatus = 'active' | 'sold' | 'deleted';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: ProductCategory;
  productImage: string;
  sellerId: string;
  sellerName: string;
  sellerGamingId: string;
  gamingId?: string;
  status: ProductStatus;
  createdAt: string;
}

export type OrderStatus = 'completed' | 'cancelled' | 'pending';

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
}

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'transfer_sent'
  | 'transfer_received'
  | 'purchase'
  | 'sale';

export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface TransactionRecord {
  id: string;
  userId: string;
  userName: string;
  type: TransactionType;
  amount: number;
  fee: number;
  description: string;
  trxId?: string;
  recipientId?: string;
  senderId?: string;
  status: TransactionStatus;
  createdAt: string;
}

export type PaymentMethod = 'bKash' | 'Nagad' | 'Rocket';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface DepositRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  paymentMethod: PaymentMethod;
  amount: number;
  fee: number;
  trxId: string;
  status: RequestStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  paymentMethod: PaymentMethod;
  accountNumber: string;
  amount: number;
  status: RequestStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'deposit' | 'withdrawal' | 'order' | 'transfer' | 'system';
  read: boolean;
  createdAt: string;
}
