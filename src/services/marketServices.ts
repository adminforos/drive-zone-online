import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  runTransaction,
  onSnapshot,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  Product,
  Order,
  TransactionRecord,
  DepositRequest,
  WithdrawalRequest,
  UserNotification,
  UserProfile,
  PaymentMethod,
  ProductCategory,
} from '../types';

const FIXED_FEE = 20;

// ---------------- MARKETPLACE PRODUCTS ----------------

export async function createProductListing(product: Omit<Product, 'id' | 'createdAt' | 'status'>) {
  const productsRef = collection(db, 'products');
  const docRef = await addDoc(productsRef, {
    ...product,
    status: 'active',
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
}

export async function updateProductListing(productId: string, updates: Partial<Product>) {
  const docRef = doc(db, 'products', productId);
  await updateDoc(docRef, updates);
}

export async function deleteProductListing(productId: string) {
  const docRef = doc(db, 'products', productId);
  await updateDoc(docRef, { status: 'deleted' });
}

/**
 * Permanently purges all demo/seeded products from Firestore.
 */
export async function removeAllDemoProducts() {
  try {
    const q = query(collection(db, 'products'));
    const snap = await getDocs(q);
    const deletePromises: Promise<void>[] = [];

    snap.docs.forEach((docSnap) => {
      const data = docSnap.data();
      if (
        data.sellerId?.startsWith('system-seed-seller') ||
        data.gamingId === 'SKIN-BOLIDE-01' ||
        data.gamingId === 'ACC-VIP-8819' ||
        data.gamingId === 'CURR-500K-DIAMONDS' ||
        data.gamingId === 'TUNE-F1-MAX'
      ) {
        deletePromises.push(deleteDoc(doc(db, 'products', docSnap.id)));
      }
    });

    await Promise.all(deletePromises);
    console.log('Successfully purged all demo products from Firestore.');
  } catch (e) {
    console.error('Error purging demo products:', e);
  }
}

export function subscribeActiveProducts(callback: (products: Product[]) => void) {
  const q = query(
    collection(db, 'products'),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, (snapshot) => {
    const products: Product[] = snapshot.docs
      .map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as Product[];

    // Filter out demo products client-side as well
    const realUserProducts = products.filter(
      (p) =>
        !p.sellerId?.startsWith('system-seed-seller') &&
        p.gamingId !== 'SKIN-BOLIDE-01' &&
        p.gamingId !== 'ACC-VIP-8819' &&
        p.gamingId !== 'CURR-500K-DIAMONDS' &&
        p.gamingId !== 'TUNE-F1-MAX'
    );

    callback(realUserProducts);
  });
}

// ---------------- ATOMIC PRODUCT PURCHASE ----------------

export async function purchaseProductAtomic(buyer: UserProfile, product: Product) {
  if (buyer.uid === product.sellerId) {
    throw new Error('You cannot purchase your own product listing.');
  }

  await runTransaction(db, async (transaction) => {
    const buyerRef = doc(db, 'users', buyer.uid);
    const sellerRef = doc(db, 'users', product.sellerId);
    const productRef = doc(db, 'products', product.id);

    const buyerSnap = await transaction.get(buyerRef);
    const sellerSnap = await transaction.get(sellerRef);
    const productSnap = await transaction.get(productRef);

    if (!buyerSnap.exists()) throw new Error('Buyer account profile not found.');
    if (!productSnap.exists()) throw new Error('Product is no longer available.');

    const buyerData = buyerSnap.data() as UserProfile;
    const productData = productSnap.data() as Product;

    if (buyerData.status === 'suspended') {
      throw new Error('Your account is suspended. Please contact support.');
    }

    if (productData.status !== 'active') {
      throw new Error('This item has already been sold or removed.');
    }

    if (buyerData.balance < productData.price) {
      throw new Error(
        `Insufficient wallet balance. You have ৳${buyerData.balance}, but item costs ৳${productData.price}. Please deposit funds.`
      );
    }

    const sellerData = sellerSnap.exists()
      ? (sellerSnap.data() as UserProfile)
      : { fullName: product.sellerName, email: '' };

    // Deduct from buyer
    const newBuyerBalance = buyerData.balance - productData.price;
    const newBuyerSpending = (buyerData.totalSpending || 0) + productData.price;
    transaction.update(buyerRef, {
      balance: newBuyerBalance,
      totalSpending: newBuyerSpending,
    });

    // Credit to seller
    if (sellerSnap.exists()) {
      const currentSellerBalance = sellerSnap.data().balance || 0;
      transaction.update(sellerRef, {
        balance: currentSellerBalance + productData.price,
      });
    }

    // Update product status
    transaction.update(productRef, { status: 'sold' });

    // Create Order Record
    const orderRef = doc(collection(db, 'orders'));
    transaction.set(orderRef, {
      id: orderRef.id,
      productId: product.id,
      productTitle: product.title,
      productImage: product.productImage,
      buyerId: buyer.uid,
      buyerName: buyer.fullName,
      buyerEmail: buyer.email,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      sellerEmail: sellerData.email || '',
      amount: product.price,
      status: 'completed',
      createdAt: new Date().toISOString(),
    });

    // Buyer Transaction Record
    const buyerTrxRef = doc(collection(db, 'transactions'));
    transaction.set(buyerTrxRef, {
      id: buyerTrxRef.id,
      userId: buyer.uid,
      userName: buyer.fullName,
      type: 'purchase',
      amount: -product.price,
      fee: 0,
      description: `Purchased: ${product.title}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    });

    // Seller Transaction Record
    const sellerTrxRef = doc(collection(db, 'transactions'));
    transaction.set(sellerTrxRef, {
      id: sellerTrxRef.id,
      userId: product.sellerId,
      userName: product.sellerName,
      type: 'sale',
      amount: product.price,
      fee: 0,
      description: `Sold item: ${product.title}`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    });

    // Buyer Notification
    const buyerNotifRef = doc(collection(db, 'notifications'));
    transaction.set(buyerNotifRef, {
      id: buyerNotifRef.id,
      userId: buyer.uid,
      title: 'Item Purchased Successfully',
      message: `You bought "${product.title}" for ৳${product.price}. Check My Orders for details.`,
      type: 'order',
      read: false,
      createdAt: new Date().toISOString(),
    });

    // Seller Notification
    const sellerNotifRef = doc(collection(db, 'notifications'));
    transaction.set(sellerNotifRef, {
      id: sellerNotifRef.id,
      userId: product.sellerId,
      title: 'Product Sold!',
      message: `Your product "${product.title}" was purchased by ${buyer.fullName} for ৳${product.price}. ৳${product.price} credited to wallet.`,
      type: 'order',
      read: false,
      createdAt: new Date().toISOString(),
    });
  });
}

// ---------------- WALLET DEPOSIT SYSTEM ----------------

export async function submitDepositRequest(
  user: UserProfile,
  method: PaymentMethod,
  amount: number,
  trxId: string
) {
  const cleanTrxId = trxId.trim().toUpperCase();

  // Check for duplicate TrxId
  const q = query(collection(db, 'depositRequests'), where('trxId', '==', cleanTrxId));
  const snap = await getDocs(q);
  if (!snap.empty) {
    throw new Error('This Transaction ID (TrxID) has already been submitted!');
  }

  const depositRef = collection(db, 'depositRequests');
  const newReq = await addDoc(depositRef, {
    userId: user.uid,
    userName: user.fullName,
    userEmail: user.email,
    paymentMethod: method,
    amount: amount,
    fee: FIXED_FEE,
    trxId: cleanTrxId,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  // User Notification
  await addDoc(collection(db, 'notifications'), {
    userId: user.uid,
    title: 'Deposit Request Submitted',
    message: `Your deposit request of ৳${amount} via ${method} (TrxID: ${cleanTrxId}) has been submitted and is under admin review.`,
    type: 'deposit',
    read: false,
    createdAt: new Date().toISOString(),
  });

  return newReq.id;
}

// ---------------- ATOMIC USER-TO-USER TRANSFER ----------------

export async function transferMoneyAtomic(
  sender: UserProfile,
  recipientIdentifier: string,
  amount: number
) {
  if (amount <= 0) throw new Error('Transfer amount must be greater than ৳0.');
  const totalDeduction = amount + FIXED_FEE;

  if (sender.balance < totalDeduction) {
    throw new Error(
      `Insufficient balance. Transfer amount (৳${amount}) + fee (৳${FIXED_FEE}) requires ৳${totalDeduction}, but your balance is ৳${sender.balance}.`
    );
  }

  // Find recipient by Gaming ID or Email
  const cleanIdent = recipientIdentifier.trim();
  let recipientRef = null;
  let recipientSnap = null;

  // Search by Gaming ID first
  const qGaming = query(collection(db, 'users'), where('gamingId', '==', cleanIdent));
  const snapGaming = await getDocs(qGaming);

  if (!snapGaming.empty) {
    recipientSnap = snapGaming.docs[0];
    recipientRef = doc(db, 'users', recipientSnap.id);
  } else {
    // Search by Email
    const qEmail = query(
      collection(db, 'users'),
      where('email', '==', cleanIdent.toLowerCase())
    );
    const snapEmail = await getDocs(qEmail);

    if (!snapEmail.empty) {
      recipientSnap = snapEmail.docs[0];
      recipientRef = doc(db, 'users', recipientSnap.id);
    } else {
      // Search by UID
      const docDirect = await getDoc(doc(db, 'users', cleanIdent));
      if (docDirect.exists()) {
        recipientSnap = docDirect;
        recipientRef = doc(db, 'users', cleanIdent);
      }
    }
  }

  if (!recipientRef || !recipientSnap || !recipientSnap.exists()) {
    throw new Error(
      `Recipient account "${cleanIdent}" was not found. Please verify the Gaming ID or Email.`
    );
  }

  const recipientData = recipientSnap.data() as UserProfile;

  if (recipientData.uid === sender.uid) {
    throw new Error('You cannot transfer money to your own account.');
  }

  if (recipientData.status === 'suspended') {
    throw new Error('Recipient account is currently suspended.');
  }

  await runTransaction(db, async (transaction) => {
    const senderRef = doc(db, 'users', sender.uid);
    const senderDoc = await transaction.get(senderRef);
    const recipientDoc = await transaction.get(recipientRef!);

    if (!senderDoc.exists()) throw new Error('Sender account not found.');
    if (!recipientDoc.exists()) throw new Error('Recipient account not found.');

    const currentSenderBalance = senderDoc.data().balance || 0;
    if (currentSenderBalance < totalDeduction) {
      throw new Error('Insufficient wallet balance to cover transfer and ৳20 fee.');
    }

    // Deduct from sender
    transaction.update(senderRef, {
      balance: currentSenderBalance - totalDeduction,
      totalTransfers: (senderDoc.data().totalTransfers || 0) + amount,
    });

    // Credit recipient
    const currentRecipientBalance = recipientDoc.data().balance || 0;
    transaction.update(recipientRef!, {
      balance: currentRecipientBalance + amount,
    });

    // Sender Transaction Log
    const senderTrxRef = doc(collection(db, 'transactions'));
    transaction.set(senderTrxRef, {
      id: senderTrxRef.id,
      userId: sender.uid,
      userName: sender.fullName,
      type: 'transfer_sent',
      amount: -totalDeduction,
      fee: FIXED_FEE,
      description: `Transferred ৳${amount} to ${recipientData.fullName} (${recipientData.gamingId}) [Fee: ৳${FIXED_FEE}]`,
      recipientId: recipientData.uid,
      status: 'completed',
      createdAt: new Date().toISOString(),
    });

    // Recipient Transaction Log
    const recipientTrxRef = doc(collection(db, 'transactions'));
    transaction.set(recipientTrxRef, {
      id: recipientTrxRef.id,
      userId: recipientData.uid,
      userName: recipientData.fullName,
      type: 'transfer_received',
      amount: amount,
      fee: 0,
      description: `Received ৳${amount} from ${sender.fullName} (${sender.gamingId})`,
      senderId: sender.uid,
      status: 'completed',
      createdAt: new Date().toISOString(),
    });

    // Sender Notification
    const senderNotifRef = doc(collection(db, 'notifications'));
    transaction.set(senderNotifRef, {
      id: senderNotifRef.id,
      userId: sender.uid,
      title: 'Money Transfer Sent',
      message: `You successfully transferred ৳${amount} to ${recipientData.fullName}. Fee: ৳${FIXED_FEE}.`,
      type: 'transfer',
      read: false,
      createdAt: new Date().toISOString(),
    });

    // Recipient Notification
    const recipientNotifRef = doc(collection(db, 'notifications'));
    transaction.set(recipientNotifRef, {
      id: recipientNotifRef.id,
      userId: recipientData.uid,
      title: 'Money Received',
      message: `You received ৳${amount} in your wallet from ${sender.fullName}.`,
      type: 'transfer',
      read: false,
      createdAt: new Date().toISOString(),
    });
  });

  return recipientData.fullName;
}

// ---------------- WITHDRAWAL REQUESTS ----------------

export async function submitWithdrawalRequest(
  user: UserProfile,
  method: PaymentMethod,
  accountNumber: string,
  amount: number
) {
  if (amount <= 0) throw new Error('Withdrawal amount must be greater than ৳0.');
  if (user.balance < amount) {
    throw new Error(
      `Insufficient wallet balance. You have ৳${user.balance}, but requested ৳${amount}.`
    );
  }

  const withdrawRef = collection(db, 'withdrawalRequests');
  const newReq = await addDoc(withdrawRef, {
    userId: user.uid,
    userName: user.fullName,
    userEmail: user.email,
    paymentMethod: method,
    accountNumber: accountNumber.trim(),
    amount: amount,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  // User Notification
  await addDoc(collection(db, 'notifications'), {
    userId: user.uid,
    title: 'Withdrawal Request Submitted',
    message: `Your withdrawal request of ৳${amount} to ${method} (${accountNumber}) has been received and is under processing.`,
    type: 'withdrawal',
    read: false,
    createdAt: new Date().toISOString(),
  });

  return newReq.id;
}

// ---------------- ADMIN DEPOSIT APPROVAL/REJECTION ----------------

export async function approveDepositAtomic(requestId: string, adminNote: string = '') {
  await runTransaction(db, async (transaction) => {
    const reqRef = doc(db, 'depositRequests', requestId);
    const reqSnap = await transaction.get(reqRef);

    if (!reqSnap.exists()) throw new Error('Deposit request not found.');

    const reqData = reqSnap.data() as DepositRequest;

    if (reqData.status !== 'pending') {
      throw new Error(`This deposit request is already ${reqData.status}.`);
    }

    const userRef = doc(db, 'users', reqData.userId);
    const userSnap = await transaction.get(userRef);

    if (!userSnap.exists()) throw new Error('Target user account not found.');

    const userData = userSnap.data() as UserProfile;
    const currentBalance = userData.balance || 0;
    const currentDeposits = userData.totalDeposits || 0;

    // Update user balance
    transaction.update(userRef, {
      balance: currentBalance + reqData.amount,
      totalDeposits: currentDeposits + reqData.amount,
    });

    // Update request status
    transaction.update(reqRef, {
      status: 'approved',
      adminNote: adminNote,
      updatedAt: new Date().toISOString(),
    });

    // Transaction Record
    const trxRef = doc(collection(db, 'transactions'));
    transaction.set(trxRef, {
      id: trxRef.id,
      userId: reqData.userId,
      userName: reqData.userName,
      type: 'deposit',
      amount: reqData.amount,
      fee: reqData.fee || 20,
      description: `Deposit via ${reqData.paymentMethod} (TrxID: ${reqData.trxId}) Approved.`,
      trxId: reqData.trxId,
      status: 'completed',
      createdAt: new Date().toISOString(),
    });

    // Notification
    const notifRef = doc(collection(db, 'notifications'));
    transaction.set(notifRef, {
      id: notifRef.id,
      userId: reqData.userId,
      title: 'Deposit Approved! 🎉',
      message: `Your deposit of ৳${reqData.amount} via ${reqData.paymentMethod} (TrxID: ${reqData.trxId}) has been approved and credited to your wallet!`,
      type: 'deposit',
      read: false,
      createdAt: new Date().toISOString(),
    });
  });
}

export async function rejectDeposit(requestId: string, adminNote: string = '') {
  const reqRef = doc(db, 'depositRequests', requestId);
  const reqSnap = await getDoc(reqRef);

  if (!reqSnap.exists()) throw new Error('Deposit request not found.');
  const reqData = reqSnap.data() as DepositRequest;

  if (reqData.status !== 'pending') {
    throw new Error(`Deposit request is already ${reqData.status}.`);
  }

  await updateDoc(reqRef, {
    status: 'rejected',
    adminNote: adminNote || 'Transaction verification failed.',
    updatedAt: new Date().toISOString(),
  });

  // Notification
  await addDoc(collection(db, 'notifications'), {
    userId: reqData.userId,
    title: 'Deposit Request Rejected',
    message: `Your deposit request of ৳${reqData.amount} (TrxID: ${reqData.trxId}) was rejected. Reason: ${adminNote || 'Invalid or duplicate Transaction ID.'}`,
    type: 'deposit',
    read: false,
    createdAt: new Date().toISOString(),
  });
}

// ---------------- ADMIN WITHDRAWAL APPROVAL ----------------

export async function approveWithdrawal(requestId: string, adminNote: string = '') {
  const reqRef = doc(db, 'withdrawalRequests', requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error('Withdrawal request not found.');

  const reqData = reqSnap.data() as WithdrawalRequest;
  if (reqData.status !== 'pending') throw new Error('Request already processed.');

  const userRef = doc(db, 'users', reqData.userId);
  const userSnap = await getDoc(userRef);
  if (!userSnap.exists()) throw new Error('User not found.');

  const userData = userSnap.data() as UserProfile;
  if (userData.balance < reqData.amount) {
    throw new Error('User balance is insufficient for this withdrawal approval.');
  }

  await runTransaction(db, async (transaction) => {
    transaction.update(userRef, {
      balance: userData.balance - reqData.amount,
    });

    transaction.update(reqRef, {
      status: 'approved',
      adminNote: adminNote || 'Payout sent successfully.',
      updatedAt: new Date().toISOString(),
    });

    const trxRef = doc(collection(db, 'transactions'));
    transaction.set(trxRef, {
      id: trxRef.id,
      userId: reqData.userId,
      userName: reqData.userName,
      type: 'withdrawal',
      amount: -reqData.amount,
      fee: 0,
      description: `Withdrawal via ${reqData.paymentMethod} (${reqData.accountNumber}) Approved.`,
      status: 'completed',
      createdAt: new Date().toISOString(),
    });

    const notifRef = doc(collection(db, 'notifications'));
    transaction.set(notifRef, {
      id: notifRef.id,
      userId: reqData.userId,
      title: 'Withdrawal Approved! 💰',
      message: `Your withdrawal of ৳${reqData.amount} to ${reqData.paymentMethod} (${reqData.accountNumber}) has been processed!`,
      type: 'withdrawal',
      read: false,
      createdAt: new Date().toISOString(),
    });
  });
}

export async function rejectWithdrawal(requestId: string, adminNote: string = '') {
  const reqRef = doc(db, 'withdrawalRequests', requestId);
  const reqSnap = await getDoc(reqRef);
  if (!reqSnap.exists()) throw new Error('Withdrawal request not found.');

  const reqData = reqSnap.data() as WithdrawalRequest;
  await updateDoc(reqRef, {
    status: 'rejected',
    adminNote: adminNote || 'Verification error.',
    updatedAt: new Date().toISOString(),
  });

  await addDoc(collection(db, 'notifications'), {
    userId: reqData.userId,
    title: 'Withdrawal Request Rejected',
    message: `Your withdrawal request of ৳${reqData.amount} was rejected. Reason: ${adminNote || 'Account details mismatch.'}`,
    type: 'withdrawal',
    read: false,
    createdAt: new Date().toISOString(),
  });
}

// ---------------- ADMIN USER MANAGEMENT ----------------

export async function toggleUserSuspension(userId: string, currentStatus: 'active' | 'suspended') {
  const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
  await updateDoc(doc(db, 'users', userId), { status: newStatus });
}

export async function adminAdjustBalance(userId: string, newBalance: number) {
  await updateDoc(doc(db, 'users', userId), { balance: newBalance });
}
