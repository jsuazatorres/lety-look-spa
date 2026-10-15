/**
 * LETY LOOK SPA - Cloud Database Sync Service (Firebase Firestore)
 * Alojado en GitHub Pages con Base de Datos en la Nube Firebase (letylookspa)
 */

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAJ_rMu-lc-1MkZjvgd4XuUqEKLvOqyzZA",
  authDomain: "letylookspa.firebaseapp.com",
  projectId: "letylookspa",
  storageBucket: "letylookspa.firebasestorage.app",
  messagingSenderId: "703667516896",
  appId: "1:703667516896:web:0acc4fa1f998dcdbcc2785",
  measurementId: "G-MH164DVSXK"
};

const FIREBASE_CONFIG_KEY = 'lety_look_firebase_config';

window.STORAGE_KEYS = Object.assign(window.STORAGE_KEYS || {}, {
    SERVICES: 'lety_look_services',
    STAFF: 'lety_look_staff',
    APPOINTMENTS: 'lety_look_appointments',
    SETTINGS: 'lety_look_settings',
    CLIENTS: 'lety_look_clients',
    CURRENT_CLIENT: 'lety_look_current_client',
    SHOP_PRODUCTS: 'lety_look_shop_products',
    ORDERS: 'lety_look_orders',
    CLIENT_CART: 'lety_look_client_cart'
});
var STORAGE_KEYS = window.STORAGE_KEYS;

class FirebaseCloudService {
    constructor() {
        this.app = null;
        this.db = null;
        this.isInitialized = false;
        this.onSyncCallbacks = [];
        this.init();
    }

    getConfig() {
        try {
            const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
            return raw ? JSON.parse(raw) : DEFAULT_FIREBASE_CONFIG;
        } catch (e) {
            return DEFAULT_FIREBASE_CONFIG;
        }
    }

    saveConfig(configObj) {
        if (!configObj || !configObj.apiKey || !configObj.projectId) {
            return { success: false, message: 'La configuración debe incluir al menos apiKey y projectId.' };
        }
        localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(configObj));
        return this.init();
    }

    init() {
        const config = this.getConfig();
        if (!config || !window.firebase) {
            this.isInitialized = false;
            return { success: false, message: 'Firebase SDK no cargado.' };
        }

        try {
            if (!firebase.apps.length) {
                this.app = firebase.initializeApp(config);
            } else {
                this.app = firebase.app();
            }
            this.db = firebase.firestore();
            this.isInitialized = true;
            this.setupRealtimeListeners();
            console.log('Firebase Cloud Service initialized successfully with Firestore (letylookspa).');
            return { success: true, message: '¡Conectado exitosamente a la base de datos en la nube!' };
        } catch (error) {
            console.error('Error initializing Firebase:', error);
            this.isInitialized = false;
            return { success: false, message: error.message };
        }
    }

    onSync(callback) {
        if (typeof callback === 'function') {
            this.onSyncCallbacks.push(callback);
        }
    }

    triggerSync(collectionName) {
        this.onSyncCallbacks.forEach(cb => {
            try { cb(collectionName); } catch (e) { console.error('Sync callback error:', e); }
        });
    }

    setupRealtimeListeners() {
        if (!this.db) return;

        // 1. Sync Services
        this.db.collection('lety_look_services').onSnapshot(snapshot => {
            const cloudItems = [];
            snapshot.forEach(doc => cloudItems.push({ id: doc.id, ...doc.data() }));
            if (cloudItems.length > 0) {
                localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(cloudItems));
                this.triggerSync('services');
            }
        }, err => console.log('Firestore services sync error:', err));

        // 2. Sync Staff
        this.db.collection('lety_look_staff').onSnapshot(snapshot => {
            const cloudItems = [];
            snapshot.forEach(doc => cloudItems.push({ id: doc.id, ...doc.data() }));
            if (cloudItems.length > 0) {
                localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(cloudItems));
                this.triggerSync('staff');
            }
        }, err => console.log('Firestore staff sync error:', err));

        // 3. Sync Appointments
        this.db.collection('lety_look_appointments').onSnapshot(snapshot => {
            const cloudItems = [];
            snapshot.forEach(doc => cloudItems.push({ id: doc.id, ...doc.data() }));
            if (cloudItems.length > 0) {
                // Preserve local appointments not yet in cloud
                const local = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) || [];
                const mergedMap = new Map();
                local.forEach(a => mergedMap.set(a.id, a));
                cloudItems.forEach(a => mergedMap.set(a.id, a));
                const merged = Array.from(mergedMap.values());
                localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(merged));
                this.triggerSync('appointments');
            }
        }, err => console.log('Firestore appointments sync error:', err));

        // 4. Sync Settings
        this.db.collection('lety_look').doc('settings').onSnapshot(doc => {
            if (doc.exists) {
                const cloudSettings = doc.data();
                const localSettings = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS)) || {};
                localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...localSettings, ...cloudSettings }));
                this.triggerSync('settings');
            }
        }, err => console.log('Firestore settings sync error:', err));

        // 5. Sync Clients (Smart Non-Destructive Bidirectional Merge & Data Protection)
        this.db.collection('lety_look_clients').onSnapshot(snapshot => {
            const cloudClients = [];
            snapshot.forEach(doc => {
                cloudClients.push({ id: doc.id, ...doc.data() });
            });
            
            // Read local clients and safety vault backup
            const localRaw = localStorage.getItem(STORAGE_KEYS.CLIENTS);
            const vaultRaw = localStorage.getItem('lety_look_clients_vault_backup');
            let local = [];
            try {
                local = localRaw ? JSON.parse(localRaw) : [];
            } catch (e) {
                local = [];
            }
            if ((!Array.isArray(local) || local.length === 0) && vaultRaw) {
                try { local = JSON.parse(vaultRaw) || []; } catch(e) {}
            }

            // CRITICAL PROTECTION:
            // If the cloud snapshot is empty, NEVER wipe local clients!
            // If local clients exist, preserve them and push them to the cloud.
            if (cloudClients.length === 0) {
                if (local.length > 0) {
                    console.log('Base de datos en la nube de clientas vacía. Preservando información local y sincronizando a la nube...');
                    this.uploadAllLocalDataToCloud();
                }
                return;
            }

            // Smart Merge: Preserve all local clients, their edited information and notes
            const mergedMap = new Map();
            local.forEach(c => {
                if (c && c.id) mergedMap.set(c.id, c);
            });

            cloudClients.forEach(c => {
                if (c && c.id) {
                    const existing = mergedMap.get(c.id);
                    if (existing) {
                        // Compare update timestamps if present to avoid overwriting newer local edits
                        const localUpdated = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
                        const cloudUpdated = c.updatedAt ? new Date(c.updatedAt).getTime() : 0;
                        if (localUpdated > cloudUpdated) {
                            // Local client has newer edits, keep local and re-sync to cloud
                            mergedMap.set(c.id, { ...c, ...existing });
                            this.saveCloudDocument('lety_look_clients', c.id, existing);
                        } else {
                            mergedMap.set(c.id, { ...existing, ...c });
                        }
                    } else {
                        mergedMap.set(c.id, c);
                    }
                }
            });

            const merged = Array.from(mergedMap.values());
            localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(merged));
            localStorage.setItem('lety_look_clients_vault_backup', JSON.stringify(merged));

            // Refresh CURRENT_CLIENT safely if logged in user was updated
            const currentRaw = localStorage.getItem(STORAGE_KEYS.CURRENT_CLIENT);
            if (currentRaw) {
                try {
                    const current = JSON.parse(currentRaw);
                    const freshClient = merged.find(c => c.id === current.id || (c.email && c.email.toLowerCase() === (current.email || '').toLowerCase()));
                    if (freshClient) {
                        localStorage.setItem(STORAGE_KEYS.CURRENT_CLIENT, JSON.stringify(freshClient));
                    }
                } catch (e) {}
            }

            this.triggerSync('clients');
        }, err => console.log('Firestore clients sync error:', err));

        // 6. Sync Shop Products
        this.db.collection('lety_look').doc('shop_products').onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                if (data && Array.isArray(data.list) && data.list.length > 0) {
                    localStorage.setItem(STORAGE_KEYS.SHOP_PRODUCTS, JSON.stringify(data.list));
                    this.triggerSync('shop_products');
                    window.dispatchEvent(new CustomEvent('lety_shop_updated', { detail: { products: data.list } }));
                }
            }
        }, err => console.log('Firestore shop_products sync error:', err));

        // 7. Sync Shop Orders
        this.db.collection('lety_look').doc('orders').onSnapshot(doc => {
            if (doc.exists) {
                const data = doc.data();
                if (data && Array.isArray(data.list)) {
                    const valid = data.list.filter(ord => ord && (ord.orderNumber || (Array.isArray(ord.items) && ord.items.length > 0)));
                    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(valid));
                    this.triggerSync('orders');
                    window.dispatchEvent(new CustomEvent('lety_shop_updated', { detail: { orders: valid } }));
                }
            }
        }, err => console.log('Firestore orders sync error:', err));
    }

    async saveCloudDocument(collectionName, docId, data) {
        if (!this.db || !this.isInitialized) return false;
        try {
            await this.db.collection(collectionName).doc(docId).set(data, { merge: true });
            return true;
        } catch (error) {
            console.error(`Error saving cloud document in ${collectionName}/${docId}:`, error);
            return false;
        }
    }

    async deleteCloudDocument(collectionName, docId) {
        if (!this.db || !this.isInitialized) return false;
        try {
            await this.db.collection(collectionName).doc(docId).delete();
            return true;
        } catch (error) {
            console.error(`Error deleting cloud document in ${collectionName}/${docId}:`, error);
            return false;
        }
    }

    async deleteCloudClient(id, clientData = null) {
        if (!this.db || !this.isInitialized) return false;
        try {
            // Delete directly by doc ID
            await this.db.collection('lety_look_clients').doc(id).delete();

            // Also clean up duplicates with same email or phone if any
            if (clientData) {
                const cleanEmail = clientData.email ? String(clientData.email).trim().toLowerCase() : '';
                const cleanPhone = clientData.phone ? String(clientData.phone).replace(/\D/g, '') : '';
                
                const snap = await this.db.collection('lety_look_clients').get();
                const batch = this.db.batch();
                let hasExtra = false;

                snap.forEach(doc => {
                    const d = doc.data();
                    const dEmail = d.email ? String(d.email).trim().toLowerCase() : '';
                    const dPhone = d.phone ? String(d.phone).replace(/\D/g, '') : '';
                    if (doc.id === id || (cleanEmail && dEmail === cleanEmail) || (cleanPhone && cleanPhone.length >= 7 && dPhone === cleanPhone)) {
                        batch.delete(doc.ref);
                        hasExtra = true;
                    }
                });

                if (hasExtra) {
                    await batch.commit();
                }
            }
            return true;
        } catch (error) {
            console.error('Error deleting cloud client:', error);
            return false;
        }
    }

    async clearCloudCollection(collectionName) {
        if (!this.db || !this.isInitialized) return false;
        try {
            const snap = await this.db.collection(collectionName).get();
            const batch = this.db.batch();
            snap.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            console.log(`Colección ${collectionName} vaciada exitosamente en la nube.`);
            return true;
        } catch (error) {
            console.error(`Error clearing cloud collection ${collectionName}:`, error);
            return false;
        }
    }

    async uploadAllLocalDataToCloud() {
        if (!this.db || !this.isInitialized) {
            return { success: false, message: 'La base de datos en la nube no está inicializada.' };
        }

        try {
            const batch = this.db.batch();
            const services = JSON.parse(localStorage.getItem(STORAGE_KEYS.SERVICES)) || [];
            const staff = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAFF)) || [];
            const appointments = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS)) || [];
            let clients = JSON.parse(localStorage.getItem(STORAGE_KEYS.CLIENTS)) || [];
            if (!Array.isArray(clients) || clients.length === 0) {
                try { clients = JSON.parse(localStorage.getItem('lety_look_clients_vault_backup')) || []; } catch(e) {}
            }

            services.forEach(s => {
                const ref = this.db.collection('lety_look_services').doc(s.id);
                batch.set(ref, s, { merge: true });
            });

            staff.forEach(st => {
                const ref = this.db.collection('lety_look_staff').doc(st.id);
                batch.set(ref, st, { merge: true });
            });

            appointments.forEach(a => {
                const ref = this.db.collection('lety_look_appointments').doc(a.id);
                batch.set(ref, a, { merge: true });
            });

            const settingsRef = this.db.collection('lety_look').doc('settings');
            batch.set(settingsRef, settings, { merge: true });

            clients.forEach(c => {
                const ref = this.db.collection('lety_look_clients').doc(c.id);
                batch.set(ref, c, { merge: true });
            });

            // Shop Products
            const shopProducts = JSON.parse(localStorage.getItem(STORAGE_KEYS.SHOP_PRODUCTS)) || [];
            if (shopProducts.length > 0) {
                batch.set(this.db.collection('lety_look').doc('shop_products'), {
                    list: shopProducts,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            }

            // Orders
            const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS)) || [];
            if (orders.length > 0) {
                const validOrders = orders.filter(ord => ord && (ord.orderNumber || (Array.isArray(ord.items) && ord.items.length > 0)));
                batch.set(this.db.collection('lety_look').doc('orders'), {
                    list: validOrders,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            }

            await batch.commit();
            return { success: true, message: '¡Datos locales sincronizados exitosamente con la nube de Firebase!' };
        } catch (error) {
            console.error('Batch sync error:', error);
            return { success: false, message: 'Error al sincronizar con la nube: ' + error.message };
        }
    }
}

window.cloudService = new FirebaseCloudService();
