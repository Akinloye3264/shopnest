import { useState, useEffect } from "react";
import {
  fetchAllProducts,
  fetchCategories,
  fetchProductsByCategory,
  searchProducts,
} from "../services/productService";

interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  thumbnail: string;
  category: string;
  rating: number;
  stock: number;
}

interface Category {
  slug: string;
  name: string;
}

export default function Marketplace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const LIMIT = 12;

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    setLoading(true);
    const load = async () => {
      let data;
      if (selectedCategory === "all") {
        data = await fetchAllProducts(LIMIT, page * LIMIT);
      } else {
        data = await fetchProductsByCategory(selectedCategory);
      }
      setProducts(data.products);
      setLoading(false);
    };
    load();
  }, [selectedCategory, page]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length > 2) {
      setLoading(true);
      const data = await searchProducts(query);
      setProducts(data.products);
      setLoading(false);
    } else if (query.length === 0) {
      const data = await fetchAllProducts(LIMIT, 0);
      setProducts(data.products);
    }
  };

  return (
    <div style={{ padding: "32px", background: "#f9f7f4", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        
        .marketplace-container {
          font-family: 'Nunito', sans-serif;
        }

        .product-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e8e4df;
          transition: all 0.2s;
          cursor: pointer;
        }

        .product-card:hover {
          box-shadow: 0 8px 24px rgba(45,106,79,0.12);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .marketplace-container {
            padding: 16px !important;
          }
          
          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
            gap: 16px !important;
          }
        }
      `}</style>

      <div className="marketplace-container">
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: "900", color: "#1a472a", fontFamily: "'Nunito', sans-serif" }}>
            Marketplace
          </h1>
          <p style={{ color: "#666", marginTop: "6px" }}>
            Discover products from local and digital vendors
          </p>
        </div>

        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={handleSearch}
          style={{
            width: "100%",
            maxWidth: "480px",
            padding: "12px 20px",
            borderRadius: "50px",
            border: "2px solid #e0e0e0",
            fontSize: "15px",
            marginBottom: "24px",
            outline: "none",
          }}
        />

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "32px" }}>
          <button
            onClick={() => { setSelectedCategory("all"); setPage(0); }}
            style={categoryBtn(selectedCategory === "all")}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => { setSelectedCategory(cat.slug); setPage(0); }}
              style={categoryBtn(selectedCategory === cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px", color: "#666" }}>
            Loading products...
          </div>
        ) : (
          <div className="products-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "24px",
          }}>
            {products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {selectedCategory === "all" && !searchQuery && (
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "48px" }}>
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              style={pageBtn(page === 0)}
            >
              ← Previous
            </button>
            <span style={{ padding: "10px 20px", fontWeight: "700", color: "#2d6a4f" }}>
              Page {page + 1}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              style={pageBtn(false)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  return (
    <div className="product-card">
      <div style={{ height: "200px", overflow: "hidden", background: "#f5f5f5" }}>
        <img
          src={product.thumbnail}
          alt={product.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <div style={{ padding: "16px" }}>
        <span style={{
          fontSize: "11px",
          fontWeight: "700",
          textTransform: "uppercase",
          color: "#2d6a4f",
          letterSpacing: "1px",
        }}>
          {product.category}
        </span>

        <h3 style={{
          fontSize: "15px",
          fontWeight: "800",
          color: "#1a1a2e",
          margin: "6px 0 8px",
          lineHeight: "1.3",
        }}>
          {product.title}
        </h3>

        <p style={{
          fontSize: "13px",
          color: "#888",
          lineHeight: "1.5",
          marginBottom: "12px",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {product.description}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
          <span style={{ color: "#f59e0b", fontSize: "13px" }}>★</span>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#444" }}>
            {product.rating}
          </span>
          <span style={{ fontSize: "12px", color: "#aaa" }}>
            ({product.stock} in stock)
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "20px", fontWeight: "900", color: "#1a472a" }}>
            ${product.price}
          </span>
          <button
            onClick={() => setAdded(true)}
            style={{
              background: added ? "#b7e4c7" : "#1a472a",
              color: added ? "#1a472a" : "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "50px",
              fontSize: "13px",
              fontWeight: "800",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {added ? "✓ Added" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}

const categoryBtn = (active: boolean) => ({
  background: active ? "#1a472a" : "white",
  color: active ? "white" : "#444",
  border: "2px solid",
  borderColor: active ? "#1a472a" : "#e0e0e0",
  padding: "8px 18px",
  borderRadius: "50px",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
  textTransform: "capitalize" as const,
  transition: "all 0.2s",
});

const pageBtn = (disabled: boolean) => ({
  background: disabled ? "#f5f5f5" : "white",
  color: disabled ? "#aaa" : "#1a472a",
  border: "2px solid",
  borderColor: disabled ? "#e0e0e0" : "#1a472a",
  padding: "10px 24px",
  borderRadius: "50px",
  fontSize: "14px",
  fontWeight: "700",
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.5 : 1,
});
