import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

export default function PropertyDetailModal({ property, onClose }) {
  if (!property) return null;

  const images = property.localImages || [];

  const address = [
    property?.address?.subDwelling,
    property?.address?.nameNo,
    property?.address?.street,
    property?.address?.town,
    property?.address?.postcode,
  ]
    .filter(Boolean)
    .join(", ");

  const owner = property.owners?.[0];
  const phone = owner?.phoneNumbers?.[0]?.number;
  const email = owner?.emailAddresses?.[0]?.address;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh] relative">
        <button
          className="absolute top-0 right-2 text-2xl text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ×
        </button>

        <div className="space-y-4">
          {images.length > 0 ? (
            <Carousel
              showThumbs={false}
              showStatus={false}
              infiniteLoop
              useKeyboardArrows
              dynamicHeight={false}
              className="rounded-lg overflow-hidden"
            >
              {images.map((img, idx) => (
                <div key={idx}>
                  <img
                    src={img}
                    alt={`Property view ${idx + 1}`}
                    className="max-h-[450px] w-full object-cover"
                  />
                </div>
              ))}
            </Carousel>
          ) : (
            <img
              src="https://via.placeholder.com/800x600?text=No+Image"
              alt="No property available"
              className="rounded-lg w-full max-h-80 object-cover"
            />
          )}

          <div>
            <h2 className="text-2xl font-bold">
              £{property.price?.toLocaleString("en-UK") || "--"}
            </h2>
            <p className="text-gray-600 text-sm">{property.priceQualifier}</p>
          </div>

          <div className="text-sm text-gray-700">
            {property.bedrooms} beds • {property.bathrooms} baths • {property.receptions} receptions
          </div>

          <div className="text-sm text-gray-500">{address}</div>

          {phone && (
            <div className="text-sm">
              📞 <a href={`tel:${phone}`} className="text-blue-600 hover:underline">{phone}</a>
            </div>
          )}
          {email && (
            <div className="text-sm">
              ✉ <a href={`mailto:${email}`} className="text-blue-600 hover:underline">{email}</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
