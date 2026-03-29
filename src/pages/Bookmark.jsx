// src/pages/MyBookmarks.jsx

import { useEffect, useState } from "react";
import { getBookmarkedProperties } from "../api/api";

const MyBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookmarkedProperties()
      .then((data) => {
        setBookmarks(data); // this must be the array
      })
      .catch((err) => {
        console.error("❌ Error fetching bookmarks", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-4">Loading bookmarks...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Bookmarked Listings</h2>

      {Array.isArray(bookmarks) && bookmarks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookmarks.map((prop, i) => {
            const details = prop.property_details || {};
            const {
              image = "https://lid.zoocdn.com/u/1200/900/7b41f3f501d1def2e91779f831fb1ed522363653.jpg:p",
              title,
              location,
              bedrooms,
              bathrooms,
              price,
            } = details;

            return (
              <div
                key={i}
                className="bg-white rounded-xl shadow-md overflow-hidden transition hover:shadow-lg"
              >
                <img
                  src={image}
                  alt={"Property"}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1">
                    {title || "Untitled Property"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {location || "Unknown Location"}{" "}
                    {(bedrooms || bathrooms) && (
                      <>• {bedrooms || "?"} bed • {bathrooms || "?"} bath</>
                    )}
                  </p>
                  <p className="mt-2 text-purple-700 font-bold text-md">
                    £{price ? Number(price).toLocaleString() : "N/A"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No bookmarks found.</p>
      )}
    </div>
  );
};

export default MyBookmarks;
