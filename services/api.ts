import { User, StreamEvent, ProgramCredential, UserRole } from '../types';
import { MOCK_STREAMS } from '../constants';

// --- CONFIGURATION ---
export const USE_BACKEND = true; 

// Primary URL (Artisan Serve - Recommended for Local Dev)
const API_URL_ARTISAN = 'http://127.0.0.1:8000/api';
// Fallback URL (XAMPP Standard)
const API_URL_XAMPP = 'http://localhost/cea-backend/public/api';

// Helper for LocalStorage
const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch { return null; }
  },
  set: (key: string, value: any) => localStorage.setItem(key, JSON.stringify(value)),
  getString: (key: string) => localStorage.getItem(key),
  setString: (key: string, value: string) => localStorage.setItem(key, value)
};

// Current Active URL - Defaults to ARTISAN because it's easier to run
export let CURRENT_API_URL = storage.getString('api_base_url') || API_URL_ARTISAN;

export const api = {
  // --- SYSTEM CHECKS ---
  system: {
    setupAdmin: async (): Promise<string> => {
        // Try Artisan First
        try {
            console.log(`Connecting to: ${CURRENT_API_URL}/setup-admin`);
            let res = await fetch(`${CURRENT_API_URL}/setup-admin`);
            
            if (!res.ok) {
                 // Try XAMPP
                 const altUrl = API_URL_XAMPP;
                 console.log(`Retrying with: ${altUrl}/setup-admin`);
                 res = await fetch(`${altUrl}/setup-admin`);
                 if (res.ok) {
                     CURRENT_API_URL = altUrl;
                     storage.setString('api_base_url', CURRENT_API_URL);
                 }
            }
            const data = await res.json();
            return data.message || "Setup completed.";
        } catch (error: any) {
             // Fallback attempt
             try {
                const altUrl = API_URL_ARTISAN;
                const res = await fetch(`${altUrl}/setup-admin`);
                if(res.ok) {
                    CURRENT_API_URL = altUrl;
                    storage.setString('api_base_url', CURRENT_API_URL);
                    const data = await res.json();
                    return data.message;
                }
             } catch(e) {}
            throw new Error("Could not connect to Backend. Certifique-se que o terminal 'php artisan serve' esta rodando.");
        }
    }
  },

  // --- AUTHENTICATION ---
  auth: {
    login: async (email: string, password: string): Promise<User> => {
      if (!USE_BACKEND) {
          if (email === 'admin@christembassy.org' && password === 'admin123') {
            return { id: 'admin-1', name: 'Pastor Administrator', email, role: UserRole.ADMIN };
          }
          throw new Error('Invalid credentials');
      }

      try {
        let res = await fetch(`${CURRENT_API_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        // Auto-switch logic if connection fails
        if (!res.ok && res.status !== 401 && res.status !== 422) {
            const altUrl = CURRENT_API_URL === API_URL_ARTISAN ? API_URL_XAMPP : API_URL_ARTISAN;
            const resFallback = await fetch(`${altUrl}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ email, password })
            });
            if (resFallback.ok || resFallback.status === 401) {
                CURRENT_API_URL = altUrl;
                storage.setString('api_base_url', CURRENT_API_URL);
                res = resFallback;
            }
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        if (data.user) data.user.id = String(data.user.id);
        return data.user;
      } catch (error: any) {
        console.error("Login Error:", error);
        throw new Error("Erro de conexao. Verifique se o Backend esta rodando.");
      }
    },

    register: async (name: string, email: string, password: string): Promise<User> => {
       if (!USE_BACKEND) return { id: `new-${Date.now()}`, name, email, role: UserRole.USER };
       
       const res = await fetch(`${CURRENT_API_URL}/register`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
         body: JSON.stringify({ name, email, password })
       });
       const data = await res.json();
       if (!res.ok) throw new Error(data.message || 'Registration failed');
       if (data.user) data.user.id = String(data.user.id);
       return data.user;
    }
  },

  // --- STREAMS (LIVE SERVICES) ---
  streams: {
    getAll: async (): Promise<StreamEvent[]> => {
      if (!USE_BACKEND) return storage.get('app_streams') || MOCK_STREAMS;

      try {
        const res = await fetch(`${CURRENT_API_URL}/streams`);
        if (res.ok) {
            const data = await res.json();
            return Array.isArray(data) ? data.map((s: any) => ({
                ...s,
                id: String(s.id),
                isLive: Boolean(s.is_live || s.isLive),
                viewers: Number(s.viewers || 0),
                thumbnailUrl: s.thumbnail_url || s.thumbnailUrl,
                streamSource: s.stream_source || s.streamSource,
                streamUrl: s.stream_url || s.streamUrl
            })) : [];
        }
      } catch (e) {
        console.warn("Backend stream fetch failed", e);
      }
      return [];
    },

    create: async (stream: Partial<StreamEvent>): Promise<StreamEvent> => {
        if (!USE_BACKEND) {
             const newStream = { ...stream, id: Date.now().toString() } as StreamEvent;
             const current = storage.get('app_streams') || MOCK_STREAMS;
             storage.set('app_streams', [newStream, ...current]);
             return newStream;
        }

        const res = await fetch(`${CURRENT_API_URL}/streams`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(stream)
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.message || "Failed to create stream");
        return { ...data, id: String(data.id) };
    },

    update: async (stream: StreamEvent): Promise<StreamEvent> => {
        if (!USE_BACKEND) {
            const current = storage.get('app_streams') || MOCK_STREAMS;
            const updated = current.map((s: StreamEvent) => s.id === stream.id ? stream : s);
            storage.set('app_streams', updated);
            return stream;
        }

        const res = await fetch(`${CURRENT_API_URL}/streams/${stream.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(stream)
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.message || "Failed to update stream");
        return { ...data, id: String(data.id) };
    },

    delete: async (id: string): Promise<void> => {
        if (!USE_BACKEND) {
            const current = storage.get('app_streams') || MOCK_STREAMS;
            storage.set('app_streams', current.filter((s: StreamEvent) => s.id !== id));
            return;
        }

        await fetch(`${CURRENT_API_URL}/streams/${id}`, { method: 'DELETE' });
    }
  },

  // --- CREDENTIALS (PRIVATE ACCESS) ---
  credentials: {
    getAll: async (): Promise<ProgramCredential[]> => {
      if (!USE_BACKEND) return storage.get('app_credentials') || [];
      
      try {
          const res = await fetch(`${CURRENT_API_URL}/credentials`);
          if (res.ok) {
              const data = await res.json();
              return Array.isArray(data) ? data.map((c: any) => ({
                  ...c,
                  id: String(c.id),
                  firstName: c.first_name || c.firstName,
                  lastName: c.last_name || c.lastName,
                  expiresAt: c.expires_at || c.expiresAt
              })) : [];
          }
      } catch (e) {}
      return [];
    },

    create: async (cred: Partial<ProgramCredential>): Promise<ProgramCredential> => {
        if (!USE_BACKEND) {
            const newCred = { ...cred, id: Date.now().toString(), createdAt: new Date().toISOString() } as ProgramCredential;
            const current = storage.get('app_credentials') || [];
            storage.set('app_credentials', [newCred, ...current]);
            return newCred;
        }

        const res = await fetch(`${CURRENT_API_URL}/credentials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(cred)
        });
        const data = await res.json();
        if(!res.ok) throw new Error(data.message || "Failed to create credential");
        return { ...data, id: String(data.id) };
    },

    delete: async (id: string): Promise<void> => {
        if (!USE_BACKEND) {
            const current = storage.get('app_credentials') || [];
            storage.set('app_credentials', current.filter((c: ProgramCredential) => c.id !== id));
            return;
        }
        await fetch(`${CURRENT_API_URL}/credentials/${id}`, { method: 'DELETE' });
    }
  }
};