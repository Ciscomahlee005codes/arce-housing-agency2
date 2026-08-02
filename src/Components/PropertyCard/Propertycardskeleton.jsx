import React from "react";
import "./PropertyCard.css";

export default function PropertyCardSkeleton() {
  return (
    <div className="pc-card pc-skel-card" aria-hidden="true">

      {/* Image */}
      <div className="pc-img-wrap pc-skel-shimmer" />

      {/* Body */}
      <div className="pc-body">
        <div className="pc-skel-line pc-skel-shimmer pc-skel-title" />
        <div className="pc-skel-line pc-skel-shimmer pc-skel-title-short" />

        <div className="pc-skel-meta-group">
          <div className="pc-skel-line pc-skel-shimmer pc-skel-meta" />
          <div className="pc-skel-line pc-skel-shimmer pc-skel-meta-short" />
        </div>

        <div className="pc-skel-amenities">
          <span className="pc-skel-pill pc-skel-shimmer" style={{ width: 58 }} />
          <span className="pc-skel-pill pc-skel-shimmer" style={{ width: 72 }} />
          <span className="pc-skel-pill pc-skel-shimmer" style={{ width: 50 }} />
        </div>
      </div>

      {/* Footer */}
      <div className="pc-footer">
        <div className="pc-agent-row">
          <div className="pc-skel-avatar pc-skel-shimmer" />
          <div className="pc-skel-line pc-skel-shimmer pc-skel-agent-name" />
        </div>

        <div className="pc-price-row">
          <div className="pc-skel-line pc-skel-shimmer pc-skel-price" />
          <div className="pc-skel-pill pc-skel-shimmer pc-skel-btn" />
        </div>
      </div>

    </div>
  );
}