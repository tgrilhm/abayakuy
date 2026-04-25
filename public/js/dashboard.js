import { api } from './api.js';

let products = [];
let isEditing = false;

// Toast notification helper
const showToast = (message, type = 'success') => {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

document.addEventListener('DOMContentLoaded', () => {
  // Check auth
  if (!localStorage.getItem('token')) {
    window.location.replace('/login.html');
    return;
  }

  // DOM Elements
  const logoutBtn = document.getElementById('logoutBtn');
  const openModalBtn = document.getElementById('openModalBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const productModal = document.getElementById('productModal');
  const productForm = document.getElementById('productForm');
  const modalTitle = document.getElementById('modalTitle');
  const formError = document.getElementById('formError');
  const saveSpinner = document.getElementById('saveSpinner');
  const saveBtnText = document.querySelector('#saveBtn span');
  const saveBtn = document.getElementById('saveBtn');
  const searchInput = document.getElementById('searchInput');
  
  const productsBody = document.getElementById('productsBody');
  const emptyState = document.getElementById('emptyState');
  const loadingState = document.getElementById('loadingState');
  const tableWrapper = document.getElementById('tableWrapper');
  
  const currentImageContainer = document.getElementById('currentImageContainer');
  const currentImagePreview = document.getElementById('currentImagePreview');

  // Stats elements
  const totalProductsEl = document.getElementById('totalProducts');
  const totalBrandsEl = document.getElementById('totalBrands');
  const latestProductEl = document.getElementById('latestProduct');

  // Update stats
  const updateStats = () => {
    totalProductsEl.textContent = products.length;
    const brands = new Set(products.map(p => p.brand));
    totalBrandsEl.textContent = brands.size;
    if (products.length > 0) {
      latestProductEl.textContent = products[0].name;
    } else {
      latestProductEl.textContent = '—';
    }
  };

  // Load Products
  const loadProducts = async () => {
    try {
      tableWrapper.classList.add('hidden');
      emptyState.classList.add('hidden');
      loadingState.classList.remove('hidden');
      
      products = await api.getProducts();
      updateStats();
      renderProducts();
    } catch (err) {
      console.error(err);
      if (err.message.includes('token') || err.message.includes('Unauthorized')) {
        localStorage.removeItem('token');
        window.location.replace('/login.html');
      }
      showToast(err.message, 'error');
    } finally {
      loadingState.classList.add('hidden');
      if (products.length === 0) {
        emptyState.classList.remove('hidden');
      } else {
        tableWrapper.classList.remove('hidden');
      }
    }
  };

  const renderProducts = (filterText = '') => {
    productsBody.innerHTML = '';
    const filtered = filterText 
      ? products.filter(p => 
          p.name.toLowerCase().includes(filterText) ||
          p.code.toLowerCase().includes(filterText) ||
          p.brand.toLowerCase().includes(filterText)
        )
      : products;

    if (filtered.length === 0 && products.length > 0) {
      productsBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 2rem; color: var(--text-muted);">No matching products found.</td></tr>`;
      return;
    }

    filtered.forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          ${p.image_url 
            ? `<img src="${p.image_url}" alt="${p.name}" class="product-img-thumb" loading="lazy">` 
            : '<div class="no-img">📷</div>'}
        </td>
        <td><span class="product-code">${p.code}</span></td>
        <td><strong>${p.name}</strong></td>
        <td>${p.brand}</td>
        <td>${p.size}</td>
        <td><span class="product-price">EGP ${p.price.toFixed(2)}</span></td>
        <td>
          <div class="action-group">
            <button class="action-btn edit" data-id="${p.id}" title="Edit">✎</button>
            <button class="action-btn delete" data-id="${p.id}" title="Delete">🗑</button>
          </div>
        </td>
      `;
      productsBody.appendChild(tr);
    });

    // Attach event listeners
    document.querySelectorAll('.action-btn.edit').forEach(btn => {
      btn.addEventListener('click', (e) => openEditModal(e.currentTarget.dataset.id));
    });
    
    document.querySelectorAll('.action-btn.delete').forEach(btn => {
      btn.addEventListener('click', (e) => handleDelete(e.currentTarget.dataset.id));
    });
  };

  // Search
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.toLowerCase().trim();
    renderProducts(val);
  });

  // Modal handlers
  const openModal = () => {
    productForm.reset();
    productForm.productId.value = '';
    isEditing = false;
    modalTitle.textContent = 'Add Product';
    formError.classList.add('hidden');
    currentImageContainer.classList.add('hidden');
    document.getElementById('image').required = false;
    productModal.classList.remove('hidden');
  };

  const openEditModal = (id) => {
    const p = products.find(prod => prod.id === id);
    if (!p) return;
    
    isEditing = true;
    modalTitle.textContent = 'Edit Product';
    formError.classList.add('hidden');
    
    productForm.productId.value = p.id;
    productForm.code.value = p.code;
    productForm.name.value = p.name;
    productForm.brand.value = p.brand;
    productForm.size.value = p.size;
    productForm.price.value = p.price;
    
    document.getElementById('image').required = false;
    
    if (p.image_url) {
      currentImagePreview.src = p.image_url;
      currentImageContainer.classList.remove('hidden');
    } else {
      currentImageContainer.classList.add('hidden');
    }
    
    productModal.classList.remove('hidden');
  };

  const closeModal = () => {
    productModal.classList.add('hidden');
  };

  // Form Submit
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    formError.classList.add('hidden');
    saveSpinner.classList.remove('hidden');
    saveBtnText.classList.add('hidden');
    saveBtn.disabled = true;

    try {
      const formData = new FormData(productForm);
      if (formData.get('image') && formData.get('image').size === 0) {
        formData.delete('image');
      }

      if (isEditing) {
        const id = formData.get('productId');
        formData.delete('productId');
        await api.updateProduct(id, formData);
        showToast('Product updated successfully!');
      } else {
        formData.delete('productId');
        await api.createProduct(formData);
        showToast('Product created successfully!');
      }
      
      closeModal();
      await loadProducts();
    } catch (err) {
      formError.textContent = err.message;
      formError.classList.remove('hidden');
      showToast(err.message, 'error');
    } finally {
      saveSpinner.classList.add('hidden');
      saveBtnText.classList.remove('hidden');
      saveBtn.disabled = false;
    }
  });

  // Delete handler
  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await api.deleteProduct(id);
        showToast('Product deleted successfully!');
        await loadProducts();
      } catch (err) {
        showToast(err.message, 'error');
      }
    }
  };

  // Event Listeners
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.replace('/login.html');
  });

  openModalBtn.addEventListener('click', openModal);
  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside
  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeModal();
  });

  // ESC key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !productModal.classList.contains('hidden')) {
      closeModal();
    }
  });

  // Initial load
  loadProducts();
});
