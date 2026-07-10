async function api(path, options={}){ 
  console.log('API call:', path, options); 
  
  // Get current user from localStorage or context
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
  const userId = currentUser?.uid;
  
  console.log('Current user from localStorage:', currentUser);
  console.log('User ID for API call:', userId);
  
  const headers = {
    'Content-Type': 'application/json',
    ...(userId && { 'user-id': userId })
  };
  
  console.log('Request headers:', headers);
  
  // Use the correct backend port
  const baseURL = 'http://localhost:5002';
  const fullPath = path.startsWith('/') ? `${baseURL}${path}` : `${baseURL}/${path}`;
  
  const res = await fetch(fullPath, { 
    headers,
    ...options 
  }); 
  
  if(!res.ok){ 
    try{ 
      const e = await res.json(); 
      console.error('API error response:', e);
      throw new Error(e.error || e.message || 'Request failed') 
    }catch(err){ 
      console.error('API request failed:', err);
      throw new Error('Request failed') 
    } 
  } 
  const data = await res.json();
  console.log('API response:', data);
  return data;
}
export const getTransactions = ()=>api('/api/transactions')
export const addTransaction = (payload)=>api('/api/transactions',{method:'POST',body:JSON.stringify(payload)})
export const deleteTransaction = (id)=>api(`/api/transactions/${id}`,{method:'DELETE'})
export const linkBank = ()=>api('/api/link-bank',{method:'POST'})
export const getLimit = ()=>api('/api/transactions/limit')
export const setLimit = (amount)=>api('/api/transactions/limit',{method:'POST',body:JSON.stringify({amount})})
export const linkFakeBank = ()=>api('/api/bank/link',{method:'POST'})
export const importBankTransactions = ()=>api('/api/bank/transactions')
export const migrateData = ()=>api('/api/migrate-data',{method:'POST'})
