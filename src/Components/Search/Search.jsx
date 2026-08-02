import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { FaSliders } from "react-icons/fa6";
import { fetchApprovedProperties } from "../../lib/fetchProperties";
import { useNavigate } from "react-router-dom";
import "./Search.css";

const categories = [
  "All Categories",
  "By State",
  "By Location",
  "By Bedrooms",
  "By House Type",
  "By Rent",
];

const Search = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  const [category, setCategory] = useState("All Categories");
  const [showFilters, setShowFilters] = useState(false);
  const [query, setQuery] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);
  const [allProperties, setAllProperties] = useState([]);

  // Fetch properties on mount
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await fetchApprovedProperties();
        setAllProperties(data || []);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };
    loadProperties();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setQuery("");
        setFilteredItems([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setQuery("");
    setFilteredItems([]);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setFilteredItems([]);
      return;
    }

    const lowerQuery = value.toLowerCase();

    const results = allProperties.filter((item) => {
      switch (category) {
        case "By State":
          return item.state?.toLowerCase().includes(lowerQuery);
        case "By Location":
          return item.location?.toLowerCase().includes(lowerQuery);
        case "By Bedrooms":
          return item.bedrooms?.toString().includes(lowerQuery);
        case "By House Type":
          return item.type?.toLowerCase().includes(lowerQuery);
        case "By Rent":
          return item.price?.toString().includes(lowerQuery);
        case "All Categories":
        default:
          return (
            item.title?.toLowerCase().includes(lowerQuery) ||
            item.location?.toLowerCase().includes(lowerQuery) ||
            item.state?.toLowerCase().includes(lowerQuery) ||
            item.type?.toLowerCase().includes(lowerQuery)
          );
      }
    });

    setFilteredItems(results);
  };

  // ── Navigation matching App.jsx routes ──
  const handleSelectItem = (item) => {
    setQuery("");
    setFilteredItems([]);

    switch (item.listing_category) {
      case "featured_home":
        navigate(`/viewhomes/${item.id}`);
        break;

      case "featured_student":
        if (item.type === "Lodge") {
          navigate(`/lodge/${item.id}`);
        } else if (item.type === "Hostel") {
          navigate(`/hostel/${item.id}`);
        } else if (item.type === "Shared Apartment") {
          navigate(`/sharedroom/${item.id}`);
        } else {
          navigate(`/viewhomes/${item.id}`);
        }
        break;

      default:
        navigate(`/viewhomes/${item.id}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      setQuery("");
      setFilteredItems([]);
    }
  };

  return (
    <div className="container" id="searchBar" ref={containerRef}>

      {/* ── Search Bar ── */}
      <div className="searchBar">
        <button
          className={`filter-icon-button ${showFilters ? "active" : ""}`}
          onClick={() => setShowFilters((prev) => !prev)}
          title="Toggle filters"
          type="button"
        >
          <FaSliders />
        </button>

        <input
          type="text"
          id="inputField"
          placeholder={`Search ${category === "All Categories" ? "properties…" : category.replace("By ", "").toLowerCase() + "…"}`}
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />

        <div className="search-pic">
          <FaSearch className="search-icon" />
        </div>
      </div>

      {/* ── Filter Chips ── */}
      {showFilters && (
        <div className="category-row">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-button ${category === cat ? "active" : ""}`}
              onClick={() => handleCategorySelect(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* ── Results Dropdown ── */}
      {query && (
        <ul className="search-dropdown" ref={dropdownRef}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <li
                key={item.id}
                className="search-dropdown-item"
                onClick={() => handleSelectItem(item)}
              >
                <img
                  src={item.images?.[0] || "/placeholder.jpg"}
                  alt={item.title}
                  className="dropdown-img"
                />

                <div className="dropdown-info">
                  <h4>{item.title}</h4>
                  <span>
                    {item.location}
                    {item.state ? ` · ${item.state}` : ""}
                    {item.type ? ` · ${item.type}` : ""}
                  </span>
                </div>

                {item.price && (
                  <span className="dropdown-price">
                    ₦{Number(item.price).toLocaleString()}
                  </span>
                )}

                <span className="dropdown-arrow">›</span>
              </li>
            ))
          ) : (
            <li className="search-no-result">
              No results for <strong>"{query}"</strong>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default Search;