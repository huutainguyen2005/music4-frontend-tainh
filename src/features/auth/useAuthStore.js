import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';

const getSafeParsedJSON = (key) => {
    try {
        const item = localStorage.getItem(key);
        if (!item || item === "undefined" || item === "null") return null;
        return JSON.parse(item);
    } catch (e) {
        const raw = localStorage.getItem(key);
        return raw && raw !== "undefined" && raw !== "null" ? raw : null;
    }
};

const getInitialArtistId = () => {
    const stored = localStorage.getItem('artistId');
    if (stored && stored !== "undefined" && stored !== "null") return stored;
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) return null;
        const payload = jwtDecode(token);
        return payload?.artistId ? String(payload.artistId) : null;
    } catch {
        return null;
    }
};

export const useAuthStore = create((set) => ({
    userId: localStorage.getItem('userId') || null,
    artistId: getInitialArtistId(),
    username: localStorage.getItem('username') || null,
    img: localStorage.getItem('userImg') || null,
    name: getSafeParsedJSON('name'),
    role: localStorage.getItem('role') || 'listener',
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,
    error: null,

    loginSuccess: (accessToken, refreshToken, id, username, img, role, artistId) => {
        const payload = jwtDecode(accessToken);
        const name = payload?.name || null;
        const resolvedArtistId = artistId || payload?.artistId || null;

        let finalRole = (role || '').replace('ROLE_', '').toLowerCase();
        if (finalRole === 'user') finalRole = 'listener';

        localStorage.setItem('accessToken', accessToken);
        if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
        if (id) localStorage.setItem('userId', id);
        if (resolvedArtistId) {
            localStorage.setItem('artistId', String(resolvedArtistId));
        } else {
            localStorage.removeItem('artistId');
        }

        if (name) {
            localStorage.setItem('name', JSON.stringify(name));
        } else {
            localStorage.removeItem('name');
        }

        if (username) localStorage.setItem('username', username);
        if (finalRole) localStorage.setItem('role', finalRole);
        if (img && img !== 'null') {
            localStorage.setItem('userImg', img);
        } else {
            localStorage.removeItem('userImg');
        }

        set({
            userId: id,
            artistId: resolvedArtistId ? String(resolvedArtistId) : null,
            username: username,
            img: img && img !== 'null' ? img : null,
            name: name,
            role: finalRole,
            isAuthenticated: true,
            error: null
        });
    },

    logout: () => {
        localStorage.clear();
        set({
            userId: null,
            artistId: null,
            username: null,
            img: null,
            name: null,
            role: 'listener',
            isAuthenticated: false,
            error: null
        });
    },

    setArtistId: (artistId) => {
        if (artistId) {
            localStorage.setItem('artistId', String(artistId));
        } else {
            localStorage.removeItem('artistId');
        }
        set({ artistId: artistId ? String(artistId) : null });
    },

    setAuthError: (errorMsg) => set({ error: errorMsg }),
    setLoading: (isLoading) => set({ isLoading }),

    loginWithGoogle: (token, refreshToken) => {
        try {
            const payload = jwtDecode(token);
            if (!payload) {
                set({ error: "Token Google không hợp lệ." });
                return false;
            }

            if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

            let finalRole = (payload.role || "listener")
                .replace("ROLE_", "")
                .toLowerCase();
            if (finalRole === "user") finalRole = "listener";

            const finalUserId = payload.id ? String(payload.id) : null;
            const finalArtistId = payload.artistId ? String(payload.artistId) : null;
            const finalUsername = payload.sub || null;
            const name = payload.name ? String(payload.name) : null;

            if (finalUserId) localStorage.setItem("userId", finalUserId);
            if (finalArtistId) {
                localStorage.setItem("artistId", finalArtistId);
            } else {
                localStorage.removeItem("artistId");
            }
            if (finalUsername) localStorage.setItem("username", finalUsername);
            localStorage.setItem("accessToken", token);

            if (name) {
                localStorage.setItem("name", JSON.stringify(name));
            } else {
                localStorage.removeItem("name");
            }

            if (payload.img && payload.img !== 'null') {
                localStorage.setItem("userImg", payload.img);
            } else {
                localStorage.removeItem("userImg");
            }

            set({
                userId: finalUserId,
                artistId: finalArtistId,
                username: finalUsername,
                img: payload.img && payload.img !== 'null' ? payload.img : null,
                name: name,
                role: finalRole,
                isAuthenticated: true,
                error: null,
            });

            return true;
        } catch (err) {
            set({ error: "Lỗi giải mã token Google." });
            return false;
        }
    },

    updateProfile: (newName, newImg) => {
        set((state) => {
            if (newName) {
                localStorage.setItem('name', JSON.stringify(newName));
            }
            if (newImg && newImg !== 'null') {
                localStorage.setItem('userImg', newImg);
            }
            return {
                name: newName || state.name,
                img: newImg && newImg !== 'null' ? newImg : state.img
            };
        });
    },
}));
