import React, { useState, useRef, useEffect} from "react";
import "./AgentProperties.css";
import { supabase } from "../../../lib/supabase";

import { Swiper as ListingSwiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import toast from "react-hot-toast";

import {
  FiPlus, FiMapPin, FiHome, FiX, FiChevronRight,
  FiCheckCircle, FiImage, FiDollarSign, FiGrid,
  FiWifi, FiTv, FiDroplet, FiUploadCloud, FiTrash2,
} from "react-icons/fi";

import { motion, AnimatePresence } from "framer-motion";

import "swiper/css";
import "swiper/css/pagination";

const AMENITY_LIST = [
  { id: "wifi",     icon: <FiWifi />,        label: "WiFi"             },
  { id: "tv",       icon: <FiTv />,          label: "Smart TV"         },
  { id: "water",    icon: <FiDroplet />,     label: "Water Supply"     },
  { id: "pop",      icon: <FiGrid />,        label: "POP Ceiling"      },
  { id: "payment",  icon: <FiDollarSign />,  label: "Flexible Payment" },
  { id: "security", icon: <FiCheckCircle />, label: "Security"         },
  { id: "parking",  icon: <FiHome />,        label: "Parking Space"    },
  { id: "gen",      icon: <FiUploadCloud />, label: "Generator"        },
];
function PropertyDetailsModal({
  property,
  onClose,
}) {
  return (
    <div
      className="apr-backdrop"
      onClick={onClose}
    >
      <motion.div
        className="apr-property-modal"
        initial={{
          opacity: 0,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
        }}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className="apr-modal-header">
          <div>
            <h3>{property.title}</h3>
            <p>
              {property.location}
            </p>
          </div>

          <button
            className="apr-close-btn"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        {/* Images */}
        <ListingSwiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          className="apr-details-swiper"
        >
          {property.images?.map(
            (image, index) => (
              <SwiperSlide key={index}>
                <img
                  src={image}
                  alt=""
                  className="apr-detail-image"
                />
              </SwiperSlide>
            )
          )}
        </ListingSwiper>

        {/* Property Info */}
        <div className="apr-details-content">

          <div className="apr-detail-row">
            <strong>Category:</strong>
            <span>
              {property.listing_category}
            </span>
          </div>

          <div className="apr-detail-row">
            <strong>Type:</strong>
            <span>{property.type}</span>
          </div>

          <div className="apr-detail-row">
            <strong>Price:</strong>
            <span>
              ₦
              {Number(
                property.price
              ).toLocaleString()}
            </span>
          </div>

          <div className="apr-detail-row">
            <strong>Status:</strong>
            <span>
              {property.status}
            </span>
          </div>

          {property.school && (
            <div className="apr-detail-row">
              <strong>School:</strong>
              <span>
                {property.school}
              </span>
            </div>
          )}

          <div className="apr-description">
            <h4>Description</h4>

            <p>
              {property.description}
            </p>
          </div>

          <div className="apr-description">
            <h4>Amenities</h4>

            <div className="apr-card-amenities">
              {property.amenities?.map(
                (amenity) => {
                  const amenityData =
                    AMENITY_LIST.find(
                      (a) =>
                        a.id === amenity
                    );

                  return (
                    <span
                      key={amenity}
                      className="apr-amenity-pill"
                    >
                      {amenityData?.icon}
                      {amenityData?.label}
                    </span>
                  );
                }
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
const AgentProperties = () => {
  const [adding,    setAdding]    = useState(false);
  const [step,      setStep]      = useState(1);
   const [form, setForm] = useState({
  title: "",
  type: "",
  listing_category: "",
  price: "",
  location: "",
  state: "",
  school: "",
  description: "",
});
  const [images,    setImages]    = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [dragOver,  setDragOver]  = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [properties, setProperties] = useState([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const fileInputRef = useRef(null);

   const fetchProperties = async () => {
  try {
    setLoadingProperties(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("agent_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error);
      return;
    }

    setProperties(data || []);
  } catch (err) {
    console.log(err);
  } finally {
    setLoadingProperties(false);
  }
};

useEffect(() => {
  fetchProperties();
}, []);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (id) => {
    setAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  const addFiles = (files) => {
    const valid     = Array.from(files).filter(f => f.type.startsWith("image/"));
    const remaining = 10 - images.length;
    const toAdd     = valid.slice(0, remaining).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name:    file.name,
      size:    (file.size / 1024).toFixed(0) + " KB",
    }));
    setImages(prev => [...prev, ...toAdd]);
  };

  const handleFileInput = (e) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  };

  const removeImage = (index) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const setMainImage = (index) => {
    setImages(prev => {
      const updated = [...prev];
      const [main] = updated.splice(index, 1);
      return [main, ...updated];
    });
  };
  const validateStep = () => {

  // STEP 1 VALIDATION
  if (step === 1) {

    if (!form.state.trim()) {
  toast.error("State is required");
  return false;
} 
if (
  form.listing_category === "featured_student" &&
  !form.school.trim()
) {
  toast.error("School is required for student properties");
  return false;
}
    if (!form.title.trim()) {
      toast.error("Property title is required");
      return false;
    }

    if (!form.listing_category) {
      toast.error("Select listing category");
      return false;
    }

    if (!form.type) {
      toast.error("Select property type");
      return false;
    }

    if (!form.price) {
      toast.error("Annual rent is required");
      return false;
    }

    if (!form.location.trim()) {
      toast.error("Location is required");
      return false;
    }
  }

  // STEP 2 VALIDATION
  if (step === 2) {

    if (!form.description.trim()) {
      toast.error("Description is required");
      return false;
    }

    if (images.length === 0) {
      toast.error("Upload at least one image");
      return false;
    }
  }

  // STEP 3 VALIDATION
  if (step === 3) {

    if (amenities.length === 0) {
      toast.error("Select at least one amenity");
      return false;
    }
  }

  return true;
};

  const nextStep = () => {

  const isValid = validateStep();

  if (!isValid) return;

  if (step < 3) {
    setStep((s) => s + 1);
  }
};
  const prevStep = () => { if (step > 1) setStep(s => s - 1); };

  const openModal = () => {
    setAdding(true);
    setStep(1);
    setForm({ title: "", type: "Apartment", price: "", location: "", description: "" });
    setImages([]);
    setAmenities([]);
  };

  const handlePublish = async () => {
  try {
    setPublishing(true);

    // 1. Upload images to storage
    const uploadedImageUrls = [];

    for (const image of images) {
      const file = image.file;

      const fileName = `${crypto.randomUUID()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("property-images")
        .upload(fileName, file);

      if (uploadError) {
        console.log(uploadError);
         toast.error("Image upload failed");
        return;
      }

      // Get public URL
      const { data } = supabase.storage
        .from("property-images")
        .getPublicUrl(fileName);

      uploadedImageUrls.push(data.publicUrl);
    }
const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  toast.error("Please login");
  return;
}
    // 2. Save property to database
    const { error } = await supabase
  .from("properties")
  .insert([
    {
      title: form.title,
      type: form.type,
      listing_category: form.listing_category,
      price: form.price,
      location: form.location,
      state: form.state,
      school: form.school,
      description: form.description,

      images: uploadedImageUrls,
      amenities,

      status: "pending",

      agent_id: user.id, // 👈 IMPORTANT
    },
  ]);

    if (error) {
      console.log(error);
      toast.error("Failed to publish property");
      return;
    }

    toast.success("Property submitted successfully!");

    // reset everything
    setAdding(false);

    setForm({
  title: "",
  type: "",
  listing_category: "",
  price: "",
  location: "",
  description: "",
});

    setImages([]);

    setAmenities([]);

    setStep(1);

fetchProperties();

  } catch (err) {
    console.log(err);
    toast.error("Something went wrong");
  } finally {
    setPublishing(false);
  }
};

  return (
    <section className="apr-section">
      <div className="apr-header">
        <div>
          <h2 className="apr-title">Properties</h2>
          <p className="apr-sub">{properties.length} listings in your portfolio</p>
        </div>
        <button className="apr-add-btn" onClick={openModal}>
          <FiPlus size={15} /> Add Property
        </button>
      </div>

      {/* SWIPER */}
      {/* SWIPER */}
        {/* SWIPER */}
<div className="apr-swiper-wrap">
  <ListingSwiper
    className="apr-swiper"
    modules={[Pagination, Autoplay, Navigation]}
    pagination={{ clickable: true }}
    navigation={{
      prevEl: ".apr-nav-prev",
      nextEl: ".apr-nav-next",
    }}
    autoplay={{ delay: 5000, disableOnInteraction: false }}
    spaceBetween={16}
    breakpoints={{
      320: { slidesPerView: 1 },
      640: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    }}
  >
    {loadingProperties ? (
      <p>Loading properties...</p>
    ) : properties.length === 0 ? (
      <p>No properties uploaded yet.</p>
    ) : (
      properties.map((property) => (
        <SwiperSlide key={property.id}>
          <div className="apr-card">
            {/* PROPERTY IMAGE */}
            <div className="apr-img-wrap">
              <img
                src={
                  property.images?.[0] ||
                  "https://placehold.co/600x400?text=No+Image"
                }
                alt={property.title}
                className="apr-img"
              />
              <span
                className={`apr-status-badge ${
                  property.status === "pending"
                    ? "apr-status-pending"
                    : "apr-status-active"
                }`}
              >
                {property.status || "Active"}
              </span>
            </div>

            {/* PROPERTY BODY */}
            <div className="apr-card-body">
              <div className="apr-category-badge">
                {property.listing_category === "featured_home"
                  ? "Featured Home"
                  : "Student Property"}
              </div>
              <h3 className="apr-card-name">
                {property.title}
              </h3>

              <div className="apr-card-meta">
                <span className="apr-meta-item">
                  <FiMapPin size={12} />
                  {property.location}
                </span>
                <span className="apr-meta-item">
                  <FiDollarSign size={12} />
                  ₦{property.price ? parseInt(property.price).toLocaleString() : "0"}
                </span>
                <span className="apr-meta-item">
                  <FiHome size={12} />
                  {property.type}
                </span>
              </div>

              <p className="apr-card-desc">
                {property.description?.slice(0, 90)}...
              </p>

              <div className="apr-card-amenities">
                {property.amenities?.slice(0, 3).map((amenity) => {
                  const amenityData = AMENITY_LIST.find(
                    (a) => a.id === amenity
                  );
                  return (
                    <span key={amenity} className="apr-amenity-pill">
                      {amenityData?.icon}
                      {amenityData?.label}
                    </span>
                  );
                })}
              </div>

              <div className="apr-card-actions">
                <button
                  className="apr-view-btn"
                  onClick={() => setSelectedProperty(property)}
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))
    )}
  </ListingSwiper>

  <button className="apr-nav-btn apr-nav-prev" aria-label="Previous properties">
    <FiChevronRight size={18} style={{ transform: "rotate(180deg)" }} />
  </button>
  <button className="apr-nav-btn apr-nav-next" aria-label="Next properties">
    <FiChevronRight size={18} />
  </button>
</div>

      {/* ── MODAL ── */}
      <AnimatePresence>
        {adding && (
          <motion.div
            className="apr-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setAdding(false)}
          >
            {/* KEY FIX: modal is a flex column — header + steps are fixed,
                only .apr-modal-body scrolls, footer is always visible */}
            <motion.div
              className="apr-modal"
              initial={{ opacity: 0, scale: 0.93, y: 28 }}
              animate={{ opacity: 1, scale: 1,    y: 0  }}
              exit={{    opacity: 0, scale: 0.93, y: 28 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={e => e.stopPropagation()}
            >
              {/* ── FIXED: Header ── */}
              <div className="apr-modal-header">
                <div>
                  <h3>Add New Property</h3>
                  <p>Step {step} of 3 — {["Property Info", "Photos & Description", "Amenities"][step - 1]}</p>
                </div>
                <button className="apr-close-btn" onClick={() => setAdding(false)} aria-label="Close">
                  <FiX size={18} />
                </button>
              </div>

              {/* ── FIXED: Step indicator ── */}
              <div className="apr-steps">
                {[1, 2, 3].map((n, i) => (
                  <React.Fragment key={n}>
                    <div className={`apr-step ${step >= n ? "active" : ""} ${step > n ? "done" : ""}`}>
                      {step > n ? <FiCheckCircle size={15} /> : n}
                    </div>
                    {i < 2 && <div className={`apr-step-line ${step > n ? "done" : ""}`} />}
                  </React.Fragment>
                ))}
              </div>

              {/* ── SCROLLABLE: Body only ── */}
              <div className="apr-modal-body">

                {/* STEP 1 */}
                {step === 1 && (
                  <div className="apr-form-grid">
                    <div className="apr-input-group apr-full">
                      <label>Property Title *</label>
                      <input required name="title" type="text" placeholder="e.g. Luxury 2 Bedroom Apartment"
                        value={form.title} onChange={handleFormChange} />
                    </div>
                    <div className="apr-input-group">
  <label>Listing Section *</label>

  <select
    name="listing_category"
    value={form.listing_category}
    onChange={handleFormChange}
    required
  >
    <option value="">Select Section</option>

    <option value="featured_home">
      Featured Homes
    </option>

    <option value="featured_student">
      Featured For Students
    </option>
  </select>
</div>
                    <div className="apr-input-group">
  <label>Property Type *</label>

  <select
    name="type"
    value={form.type}
    onChange={handleFormChange}
    required
  >
    <option value="">Select Property Type</option>

    {/* Featured Homes */}
    {form.listing_category === "featured_home" && (
      <>
        <option value="Apartment">Apartment</option>
        <option value="Duplex">Duplex</option>
        <option value="Bungalow">Bungalow</option>
        <option value="Self Contain">Self Contain</option>
      </>
    )}

    {/* Featured Student */}
    {form.listing_category === "featured_student" && (
      <>
        <option value="Lodge">Lodge</option>
        <option value="Shared Apartment">Shared Apartment</option>
        <option value="Hostel">Hostel</option>
      </>
    )}
  </select>
</div>
                    <div className="apr-input-group">
                      <label>Annual Rent (₦)</label>
                      <input required name="price" type="text" placeholder="e.g. 850,000"
                        value={form.price} onChange={handleFormChange} />
                    </div>
                    <div className="apr-input-group apr-full">
                      <label>Location</label>
                      <input required name="location" type="text" placeholder="e.g. Lekki Phase 1, Lagos"
                        value={form.location} onChange={handleFormChange} />
                    </div>

                    <div className="apr-input-group">
  <label>State *</label>

  <input
    type="text"
    name="state"
    placeholder="e.g. Lagos"
    value={form.state}
    onChange={handleFormChange}
  />
</div>

   {form.listing_category === "featured_student" && (
  <div className="apr-input-group">
    <label>School *</label>

    <input
      type="text"
      name="school"
      placeholder="e.g. University of Lagos"
      value={form.school}
      onChange={handleFormChange}
    />
  </div>
)}
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <>
                    <div className="apr-input-group" style={{ marginBottom: "1rem" }}>
                      <label>Description</label>
                      <textarea required name="description" rows={3}
                        placeholder="Describe the property — layout, condition, nearby landmarks…"
                        value={form.description} onChange={handleFormChange} />
                    </div>

                    {/* Drop zone */}
                    <div
                      className={`apr-dropzone ${dragOver ? "drag-active" : ""} ${images.length >= 10 ? "apr-dropzone-full" : ""}`}
                      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => images.length < 10 && fileInputRef.current?.click()}
                    >
                      <input required ref={fileInputRef} type="file" multiple accept="image/*"
                        onChange={handleFileInput} hidden />
                      <FiUploadCloud size={32} className="apr-dz-icon" />
                      <p className="apr-dz-title">
                        {images.length >= 10 ? "Maximum 10 photos reached" :
                          dragOver ? "Drop photos here" : "Click or drag photos here"}
                      </p>
                      <p className="apr-dz-sub">
                        PNG · JPG · WEBP &nbsp;·&nbsp; Max 10 images
                        {images.length > 0 && ` · ${images.length}/10 added`}
                      </p>
                      {images.length < 10 && (
                        <div className="apr-dz-pill">
                          <FiImage size={13} /> Choose files
                        </div>
                      )}
                    </div>

                    {/* Preview grid */}
                    {images.length > 0 && (
                      <div className="apr-preview-grid">
                        {images.map((img, i) => (
                          <div key={i} className={`apr-preview-card ${i === 0 ? "apr-cover" : ""}`}>
                            <img src={img.preview} alt={img.name} />
                            {i === 0 && <span className="apr-cover-badge">Cover</span>}
                            <div className="apr-preview-overlay">
                              {i !== 0 && (
                                <button className="apr-pv-btn apr-pv-star"
                                  title="Set as cover" onClick={() => setMainImage(i)}>★</button>
                              )}
                              <button className="apr-pv-btn apr-pv-del"
                                title="Remove" onClick={() => removeImage(i)}>
                                <FiTrash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                        {images.length < 10 && (
                          <div className="apr-add-more-tile"
                            onClick={() => fileInputRef.current?.click()}>
                            <FiPlus size={20} />
                            <span>Add more</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <>
                    <p className="apr-amenity-hint">Select all amenities available at this property</p>
                    <div className="apr-amenities">
                      {AMENITY_LIST.map(a => (
                        <button key={a.id} type="button"
                          className={`apr-amenity ${amenities.includes(a.id) ? "apr-amenity-on" : ""}`}
                          onClick={() => toggleAmenity(a.id)}>
                          {a.icon} {a.label}
                          {amenities.includes(a.id) && <FiCheckCircle size={13} className="apr-amenity-check" />}
                        </button>
                      ))}
                    </div>

                    {/* Summary */}
                    <div className="apr-summary">
                      <h4 className="apr-summary-title">Listing summary</h4>
                      {[
                        ["Property",  form.title    || "—"],
                        ["Type",      form.type],
                        ["Rent",      form.price ? `₦${form.price}` : "—"],
                        ["Location",  form.location || "—"],
                        ["Photos",    `${images.length} uploaded`],
                        ["Amenities", `${amenities.length} selected`],
                      ].map(([k, v]) => (
                        <div key={k} className="apr-summary-row">
                          <span>{k}</span><strong>{v}</strong>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* ── FIXED: Footer — always visible ── */}
              <div className="apr-modal-footer">
                {step > 1
                  ? <button className="apr-secondary-btn" onClick={prevStep}>Back</button>
                  : <div />
                }
                {step < 3
                  ? <button className="apr-primary-btn" onClick={nextStep}>
                      Continue <FiChevronRight size={15} />
                    </button>
                  : <button className="apr-primary-btn"onClick={handlePublish}disabled={publishing}>
                        {publishing ? "Publishing..." : (
  <>
    <FiCheckCircle size={15} />
    Publish Property
  </>
)}
                    </button>
                }
              </div>
            </motion.div>
          </motion.div>
        )}
        {selectedProperty && (
  <PropertyDetailsModal
    property={selectedProperty}
    onClose={() =>
      setSelectedProperty(null)
    }
  />
)}
      </AnimatePresence>
    </section>
  );
};

export default AgentProperties;