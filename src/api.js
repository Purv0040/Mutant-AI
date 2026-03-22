const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const token = localStorage.getItem('mutant_token')
  const headers = {
    ...(options.headers || {}),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  const contentType = response.headers.get('content-type') || ''
  const data = contentType.includes('application/json') ? await response.json() : await response.text()

  if (!response.ok) {
    const detail = typeof data === 'object' && data?.detail ? data.detail : 'Request failed'
    throw new Error(detail)
  }

  return data
}

export function login(payload) {
  return request('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function register(payload) {
  return request('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function uploadDocument(file, options = {}) {
  const formData = new FormData()
  formData.append('file', file)

  if (typeof options.onProgress === 'function') {
    const token = localStorage.getItem('mutant_token')

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${API_BASE_URL}/upload`)

      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`)
      }

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return
        const percent = Math.min(100, Math.round((event.loaded / event.total) * 100))
        options.onProgress(percent)
      }

      xhr.onload = () => {
        const contentType = xhr.getResponseHeader('content-type') || ''
        const data = contentType.includes('application/json')
          ? JSON.parse(xhr.responseText || '{}')
          : xhr.responseText

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(data)
          return
        }

        const detail = typeof data === 'object' && data?.detail ? data.detail : 'Request failed'
        reject(new Error(detail))
      }

      xhr.onerror = () => reject(new Error('Network error during upload'))
      xhr.send(formData)
    })
  }

  return request('/upload', {
    method: 'POST',
    body: formData,
  })
}

export function getDocuments() {
  return request('/documents')
}

export function askQuestion(question, top_k = 5) {
  return request('/ask', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, top_k }),
  })
}

export function summarizeDoc(filename) {
  return request('/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename }),
  })
}

export function categorizeDoc(filename) {
  return request('/categorize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename }),
  })
}

// User Profile CRUD Operations
export function getUserProfile() {
  return request('/auth/profile')
}

export function updateUserProfile(payload) {
  return request('/auth/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function deleteUserAccount() {
  return request('/auth/profile', {
    method: 'DELETE',
  })
}

export function deleteDocument(docId) {
  return request(`/documents/${docId}`, {
    method: 'DELETE',
  })
}
