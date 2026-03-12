const BASE_URL = 'https://dummyjson.com';

export const fetchAllProducts = async (limit = 30, skip = 0) => {
  const res = await fetch(`${BASE_URL}/products?limit=${limit}&skip=${skip}`);
  const data = await res.json();
  return data;
};

export const fetchProductsByCategory = async (category: string) => {
  const res = await fetch(`${BASE_URL}/products/category/${category}`);
  const data = await res.json();
  return data;
};

export const fetchCategories = async () => {
  const res = await fetch(`${BASE_URL}/products/categories`);
  const data = await res.json();
  return data;
};

export const searchProducts = async (query: string) => {
  const res = await fetch(`${BASE_URL}/products/search?q=${query}`);
  const data = await res.json();
  return data;
};

export const fetchSingleProduct = async (id: number) => {
  const res = await fetch(`${BASE_URL}/products/${id}`);
  const data = await res.json();
  return data;
};
