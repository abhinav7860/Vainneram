const API_BASE = '/api';

function getAuthHeaders(isFormData = false) {
  const token = localStorage.getItem('vainneram_token');
  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
}

export async function request(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...getAuthHeaders(isFormData),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = (data && data.error) || response.statusText || 'Request failed';
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  login: (identifier, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password })
  }),
  register: (username, email, password, display_name) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, display_name })
  }),
  demoLogin: () => request('/auth/demo', { method: 'POST' }),
  getCurrentUser: () => request('/auth/me'),

  // Tracks
  getTracks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.mood && params.mood !== 'All') query.set('mood', params.mood);
    if (params.sort) query.set('sort', params.sort);
    if (params.favorite) query.set('favorite', 'true');
    const qStr = query.toString();
    return request(`/tracks${qStr ? '?' + qStr : ''}`);
  },
  getTrack: (id) => request(`/tracks/${id}`),
  updateTrack: (id, data) => request(`/tracks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deleteTrack: (id) => request(`/tracks/${id}`, { method: 'DELETE' }),
  toggleFavorite: (id) => request(`/tracks/${id}/favorite`, { method: 'POST' }),
  logPlay: (id) => request(`/tracks/${id}/play`, { method: 'POST' }),
  seedSampleTracks: () => request('/tracks/seed-samples', { method: 'POST' }),

  // Upload track with XMLHttpRequest to support true upload progress
  uploadTrackWithProgress: (formData, onProgress) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}/tracks/upload`, true);

      const token = localStorage.getItem('vainneram_token');
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(res);
          } else {
            reject(new Error(res.error || `Upload failed with status ${xhr.status}`));
          }
        } catch (err) {
          reject(new Error('Invalid response from server'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(formData);
    });
  },

  // Playlists
  getPlaylists: () => request('/playlists'),
  createPlaylist: (name, description, mood) => request('/playlists', {
    method: 'POST',
    body: JSON.stringify({ name, description, mood })
  }),
  getPlaylist: (id) => request(`/playlists/${id}`),
  updatePlaylist: (id, data) => request(`/playlists/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  deletePlaylist: (id) => request(`/playlists/${id}`, { method: 'DELETE' }),
  addTrackToPlaylist: (playlistId, trackId) => request(`/playlists/${playlistId}/tracks`, {
    method: 'POST',
    body: JSON.stringify({ track_id: trackId })
  }),
  removeTrackFromPlaylist: (playlistId, trackId) => request(`/playlists/${playlistId}/tracks/${trackId}`, {
    method: 'DELETE'
  }),
  reorderPlaylist: (playlistId, trackIds) => request(`/playlists/${playlistId}/tracks/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ track_ids: trackIds })
  }),

  // Stats
  getStats: () => request('/stats')
};
