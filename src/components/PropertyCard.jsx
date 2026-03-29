const formatAddress = (address) => {
  if (!address || typeof address !== "object") return "";
  return [
    address.subDwelling,
    address.nameNo,
    address.street,
    address.locality,
    address.town,
    address.county,
    address.postcode,
  ]
    .filter(Boolean)
    .join(", ");
};

const getContactInfo = (owner) => {
  if (!owner) return { phone: null, email: null };

  const phone = owner.phoneNumbers?.[0]?.number || null;
  const email = owner.emailAddresses?.[0]?.address || null;

  return { phone, email };
};

export default function PropertyCard({ property, onClick }) {
  const {
    localImages,
    price,
    priceQualifier,
    bedrooms,
    bathrooms,
    receptions,
    address,
    listingStatus,
    agent = {},
    owners = [],
  } = property;

  const mainImage =
    localImages?.[0] || "http://18.223.231.19:8005/400x300?text=No+Image";
  const owner = owners[0] || null;
  const { phone, email } = getContactInfo(owner);
  const displayName = owner?.name?.surname || agent?.name || "Agent";

  return (
    <div
      onClick={() => onClick && onClick(property)}
      className="cursor-pointer w-full max-w-md rounded-xl border bg-white shadow p-3 flex flex-col gap-2 hover:shadow-lg transition"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(property)}
    >
      {/* Image */}
      <div className="relative">
        <img
          src={mainImage}
          alt="property"
          className="rounded-lg w-full h-52 object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
          {localImages?.length || 0} images
        </div>
      </div>

      {/* Price */}
      <div className="text-lg font-semibold text-gray-800">
        £{price?.toLocaleString("en-UK") || "--"}
        <span className="ml-2 text-sm font-normal text-gray-500">
          {priceQualifier || (listingStatus === "rent" ? "PCM" : "")}
        </span>
      </div>

      {/* Specs */}
      <div className="text-sm text-gray-700">
        {bedrooms} beds • {bathrooms} baths • {receptions} receptions
      </div>

      {/* Address */}
      <div className="text-xs ">{formatAddress(address)}</div>

      {/* Agent + Contact */}
      <div className="flex items-center justify-between mt-2">
        <div className="text-sm font-medium text-gray-800">{displayName}</div>
        <div className="flex items-center gap-1 text-md">
          {/* Phone */}
          <span
            className={`material-symbols-outlined text-lg ${phone ? "" : ""}`}
          >
            call
          </span>
          <span
            className={`text-sm ${
              phone ? "underline text-black" : "underline"
            }`}
          >
            call
          </span>

          {/* Email */}
          <span
            className={`material-symbols-outlined text-lg ${email ? "" : ""}`}
          >
            mail
          </span>
          <span
            className={`text-sm ${
              email ? "underline text-black" : "underline"
            }`}
          >
            email
          </span>
        </div>
      </div>
    </div>
  );
}
